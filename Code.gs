/**
 * GWC Google Apps Script backend for the Render proxy.
 * Existing load/save/upload actions and spreadsheet chunk storage are preserved.
 * Monthly fee expiry is processed by a daily time trigger; payment slips are private
 * when the HTML sends privateFile:true. Posters/logo uploads remain link-viewable.
 *
 * Deploy Web App: Execute as Me; access Anyone (existing Render proxy URL remains unchanged).
 * WARNING: this is a legacy single-JSON state endpoint. Public endpoint authentication and
 * server-side authorization still need a production security review before storing sensitive data.
 */
const GWC_SHEET_NAME = 'GWC_Storage';
const GWC_CHUNK_SIZE = 30000; // safely below Google Sheets per-cell text limit
const GWC_FOLDER_NAME = 'GWC_Uploads';
const GWC_BACKUP_SHEET_NAME = 'GWC_Storage_Backup';
const GWC_DELETED_FOLDER_NAME = 'GWC_Deleted_Items';

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'load').toLowerCase();
  if (action === 'health' || action === 'ping') return json_({ok:true,service:'GWC Apps Script',time:new Date().toISOString()});
  if (['load','get','getstate','loadstate','read','loadmeta','meta','metadata','getmeta','loadmetadata'].indexOf(action) >= 0) {
    try { const st=readState_(); return json_({ok:true,state:st,meta:{service:'GWC Apps Script',time:new Date().toISOString(),hasState:!!st}}); }
    catch (err) { return json_({ok:false,error:String(err && err.message || err)}); }
  }
  if (action === 'diagnose') { try { const sh=getSheet_(); return json_({ok:true,primarySheet:sh.getName(),rows:sh.getLastRow(),backupSheetExists:!!sh.getParent().getSheetByName(GWC_BACKUP_SHEET_NAME)}); } catch(err) { return json_({ok:false,error:String(err.message||err)}); } }
  return json_({ok:false,error:'Unknown GET action: ' + action, supported:['health','load','loadmeta','diagnose']});
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw) throw new Error('Missing request body');
    const payload = JSON.parse(raw);
    const action = String(payload.action || payload.type || payload.op || payload.command || '').toLowerCase();
    if (['save','set','savestate','writestate'].indexOf(action) >= 0) {
      if ((!payload.state || typeof payload.state !== 'object' || Array.isArray(payload.state)) && payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) payload.state = payload.data;
      if (!payload.state || typeof payload.state !== 'object' || Array.isArray(payload.state)) throw new Error('Invalid state');
      writeState_(payload.state);
      return json_({ok:true,savedAt:new Date().toISOString()});
    }
    if (['upload','uploadfile'].indexOf(action) >= 0) return json_(uploadFile_(payload));
    if (['archivefile','deletefile'].indexOf(action) >= 0) return json_(archiveDriveFile_(payload));
    if (action === 'health' || action === 'ping') return json_({ok:true,service:'GWC Apps Script',time:new Date().toISOString()});
    throw new Error('Unknown POST action: ' + action);
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('GWC_SPREADSHEET_ID');
  if (!id) throw new Error('GWC_SPREADSHEET_ID Script Property missing. Refusing to create a blank spreadsheet to protect existing data.');
  const ss = SpreadsheetApp.openById(id);
  let sh = ss.getSheetByName(GWC_SHEET_NAME);
  if (!sh) throw new Error('Existing GWC_Storage sheet not found. Refusing to create a blank storage sheet.');
  return sh;
}
function readRawFromSheet_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return '';
  const rows = sh.getRange(2,1,last-1,3).getValues()
    .filter(r => r[1] !== '' && r[1] !== null)
    .sort((a,b) => Number(a[0])-Number(b[0]));
  // V15 stores each chunk with a non-formula sentinel. This prevents Sheets
  // from interpreting a chunk beginning with '=' as a formula and changing it.
  return rows.map(r => {
    const value = String(r[1] == null ? '' : r[1]);
    return value.indexOf('GWC_CHUNK_V1:') === 0 ? value.slice('GWC_CHUNK_V1:'.length) : value;
  }).join('');
}
function readState_() {
  const sh = getSheet_();
  const raw = readRawFromSheet_(sh);
  if (!raw) throw new Error('GWC_Storage has no saved state. Refusing to initialize or overwrite empty data.');
  let state; try { state=JSON.parse(raw); } catch(e) { throw new Error('GWC saved JSON is invalid. Existing data was preserved; restore a valid Sheet version or backup. Details: '+e.message); }
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('Saved JSON root is not a state object. Existing data preserved.');
  return state;
}
function gwcRecordCount_(state) {
  if (!state || typeof state !== 'object') return 0;
  return ['students','users','courses','feeRequests','attendance','homework','tests','leaves']
    .reduce((n,k)=>n+(Array.isArray(state[k])?state[k].length:0),0);
}

function writeState_(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('Refusing to save invalid state object.');
  const raw = JSON.stringify(state);
  try { const parsed=JSON.parse(raw); if(!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('bad root'); }
  catch(e) { throw new Error('New state failed JSON validation; not saved.'); }
  const chunks=[]; for(let i=0;i<raw.length;i+=GWC_CHUNK_SIZE) chunks.push(raw.slice(i,i+GWC_CHUNK_SIZE));
  const safeChunks=chunks.map(c=>'GWC_CHUNK_V1:'+c);
  const lock=LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh=getSheet_(), ss=sh.getParent();
    // Validate the existing primary state before any mutation; preserve it on errors.
    const oldRaw=readRawFromSheet_(sh);
    // V17 hard lock: never initialize/replace a blank primary from a browser payload.
    // Restore a known-good backup manually before allowing writes again.
    if(!oldRaw) throw new Error('SAFETY LOCK: GWC_Storage is empty. No data was written. Restore a verified backup into the existing spreadsheet, verify it, then retry.');
    let oldState;
    try { oldState=JSON.parse(oldRaw); if(!oldState||typeof oldState!=='object'||Array.isArray(oldState)) throw new Error('bad root'); }
    catch(e) { throw new Error('Primary JSON is invalid. Refusing to overwrite it; restore a valid version first.'); }
    const newCoreCount = ['students','users','courses'].reduce((n,k)=>n+(Array.isArray(state[k])?state[k].length:0),0);
    if(newCoreCount===0) throw new Error('SAFETY LOCK: incoming state has no students, users, or courses. No data was written. Reload the live app and verify the source state.');
    {
      const oldCount = gwcRecordCount_(oldState);
      const newCount = gwcRecordCount_(state);
      // Hard safety stop: a stale/default browser state must never erase a populated school.
      // Large intentional deletions must be performed in smaller reviewed batches after backup.
      if (oldCount >= 5 && (newCount === 0 || newCount < Math.floor(oldCount * 0.25))) {
        throw new Error('SAFETY BLOCK: incoming state contains '+newCount+' records while primary has '+oldCount+'. Refusing destructive overwrite. Reload the live app and restore/verify data first.');
      }
      // Keep an immutable hourly snapshot. Unlike a single daily sheet, this preserves
      // the latest good state even if another save happens later on the same day.
      const stamp=Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyyMMdd_HH');
      const backupName=(GWC_BACKUP_SHEET_NAME+'_'+stamp).slice(0,99);
      let bk=ss.getSheetByName(backupName);
      if(!bk){
        bk=ss.insertSheet(backupName);
        const oldRows=sh.getRange(1,1,sh.getLastRow(),3).getValues();
        bk.getRange(1,1,oldRows.length,3).setNumberFormat('@');
        bk.getRange(1,1,oldRows.length,3).setValues(oldRows);
        bk.setFrozenRows(1);
      }
    }
    // Stage the exact payload. Sentinel-prefixed chunks are always literal text,
    // including chunks whose first character would otherwise be parsed as a formula.
    let stage=ss.getSheetByName('GWC_Storage_Stage'); if(!stage) stage=ss.insertSheet('GWC_Storage_Stage');
    const now=new Date(), stageRows=[['chunk_index','json_chunk','updated_at'],...safeChunks.map((c,i)=>[String(i),c,now])];
    stage.clearContents();
    stage.getRange(1,1,stageRows.length,3).setNumberFormat('@');
    stage.getRange(1,1,stageRows.length,3).setValues(stageRows);
    const stagedRows=stage.getRange(2,1,chunks.length,3).getValues();
    const staged=stagedRows.map(r=>{const v=String(r[1]==null?'':r[1]);return v.indexOf('GWC_CHUNK_V1:')===0?v.slice('GWC_CHUNK_V1:'.length):v;}).join('');
    if(staged!==raw) {
      let badChunk=-1;
      for(let i=0;i<chunks.length;i++){
        const v=String(stagedRows[i][1]==null?'':stagedRows[i][1]);
        const decoded=v.indexOf('GWC_CHUNK_V1:')===0?v.slice('GWC_CHUNK_V1:'.length):v;
        if(decoded!==chunks[i]){badChunk=i;break;}
      }
      throw new Error('Staging verification failed after literal-text protection (chunk '+badChunk+', expected '+raw.length+' chars, read '+staged.length+'). Primary data was not changed. Check the staging sheet permissions/cell limits and retry.');
    }
    try { JSON.parse(staged); } catch(e) { throw new Error('Staging verification failed: staged JSON could not be parsed. Primary data was not changed. Details: '+e.message); }
    sh.clearContents();
    sh.getRange(1,1,stageRows.length,3).setNumberFormat('@');
    sh.getRange(1,1,stageRows.length,3).setValues(stageRows);
    sh.setFrozenRows(1);
    const finalRaw=readRawFromSheet_(sh);
    if(finalRaw!==raw) {
      // Best-effort immediate rollback from the pre-write rows while still holding the lock.
      try {
        sh.clearContents();
        const priorRows = oldRaw ? (function(){
          const priorChunks=[]; for(let i=0;i<oldRaw.length;i+=GWC_CHUNK_SIZE) priorChunks.push('GWC_CHUNK_V1:'+oldRaw.slice(i,i+GWC_CHUNK_SIZE));
          return [['chunk_index','json_chunk','updated_at'],...priorChunks.map((c,i)=>[String(i),c,new Date()])];
        })() : [['chunk_index','json_chunk','updated_at']];
        sh.getRange(1,1,priorRows.length,3).setNumberFormat('@');
        sh.getRange(1,1,priorRows.length,3).setValues(priorRows);
      } catch(rollbackErr) {}
      throw new Error('Post-save verification failed. The write was rejected and rollback attempted; check hourly GWC_Storage_Backup sheets.');
    }
  } finally { lock.releaseLock(); }
}
function uploadFile_(p) {
  if (!p.dataUrl || !p.name) throw new Error('Missing file data');
  const match = String(p.dataUrl).match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid file data');
  const bytes = Utilities.base64Decode(match[2]);
  if (bytes.length > 1000000) throw new Error('File must be 1 MB or smaller');
  const mime = String(p.mimeType || match[1] || 'application/octet-stream');
  const allowed = ['image/jpeg','image/png','image/webp','image/gif','application/pdf'];
  if (allowed.indexOf(mime) === -1) throw new Error('Only JPG, PNG, WEBP, GIF and PDF files are allowed');
  const folder = getFolder_(), blob = Utilities.newBlob(bytes, mime, safeName_(p.name)), file = folder.createFile(blob);
  // Payment slips are private; posters/logo may be public to render on the website.
  if (p.privateFile !== true) {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  }
  // For privateFile:true, do not change sharing: new Drive files are private by default.
  const id = file.getId();
  return {ok:true,fileId:id,url:'https://drive.google.com/uc?export=view&id='+encodeURIComponent(id),name:file.getName(),privateFile:p.privateFile===true};
}
function archiveDriveFile_(p) {
  const id=String(p.fileId||'').trim(); if(!id) throw new Error('Missing Drive fileId');
  const file=DriveApp.getFileById(id); let folder;
  const it=DriveApp.getFoldersByName(GWC_DELETED_FOLDER_NAME); folder=it.hasNext()?it.next():DriveApp.createFolder(GWC_DELETED_FOLDER_NAME);
  folder.addFile(file);
  try { const parents=file.getParents(); while(parents.hasNext()){const parent=parents.next(); if(parent.getId()!==folder.getId()) parent.removeFile(file);} } catch(e) {}
  return {ok:true,archived:true,fileId:id,folder:GWC_DELETED_FOLDER_NAME};
}
function getFolder_() {
  const props = PropertiesService.getScriptProperties(); let id = props.getProperty('GWC_DRIVE_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const folder = DriveApp.createFolder(GWC_FOLDER_NAME); props.setProperty('GWC_DRIVE_FOLDER_ID', folder.getId()); return folder;
}
function safeName_(name) { return String(name).replace(/[\\/:*?"<>|#%{}~&]/g,'_').slice(0,120) || 'gwc-file'; }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }

/**
 * Run once manually from Apps Script editor to install daily expiry processing.
 * Existing spreadsheet ID and Drive folder ID are retained in Script Properties.
 */
function installGwcDailyFeeTrigger() {
  try { Session.getScriptTimeZone(); } catch (e) {}
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => { if (t.getHandlerFunction() === 'processGwcMonthlyFees') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('processGwcMonthlyFees').timeBased().everyDays(1).atHour(2).create();
  return 'Daily GWC monthly-fee expiry trigger installed.';
}

/**
 * Daily backend enforcement. Course stays active through endAt; it is deactivated only
 * after the final approved period has ended. Day-28 reminder flag is saved for the site
 * to show when the parent/student next opens the website. This does not send push/SMS/
 * WhatsApp while the website is closed; that requires a notification provider.
 */
function processGwcMonthlyFees() {
  const state = readState_();
  if (!state || !Array.isArray(state.students)) return 'No student state found.';
  const now = new Date();
  // Keep date calculations aligned with the Apps Script project timezone (set it to Asia/Kolkata).
  let changed = false;
  state.students.forEach(st => {
    // New fixed-date cycle records: keep access only while an approved monthly period is current.
    // Legacy records without monthlyPaymentDate continue through the original validity logic below.
    if (st && st.monthlyPaymentDate) {
      const day = Math.min(28, Math.max(1, Number(st.monthlyPaymentDate) || 5));
      const periodsFixed = Array.isArray(st.feePeriods) ? st.feePeriods.filter(p => p && !p.reversedAt) : [];
      const currentFixed = periodsFixed.filter(p => p && p.startAt && p.endAt &&
        new Date(p.startAt).getTime() <= now.getTime() && new Date(p.endAt).getTime() > now.getTime())
        .sort((a,b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime())[0] || null;
      const limit = Math.max(1, Number(st.totalCycles) || 1200);
      const cyclesDone = Math.max(0, Number(st.approvedCycles) || 0);
      const hasPendingFee = Array.isArray(state.feeRequests) && state.feeRequests.some(q => q && q.studentId === st.id && q.status === 'pending');
      const forceStart = st.forceActiveStart ? new Date(String(st.forceActiveStart).slice(0,10)+'T00:00:00') : null;
      const forceEnd = st.forceActiveEnd ? new Date(String(st.forceActiveEnd).slice(0,10)+'T23:59:59.999') : null;
      const forceNow = st.forceActive === true && st.adminPaused !== true && forceStart && forceEnd && now >= forceStart && now <= forceEnd;
      const activeFixed = st.adminPaused !== true && (forceNow || (cyclesDone < limit && !!currentFixed && !hasPendingFee));
      if (st.courseAccessActive !== activeFixed) { st.courseAccessActive = activeFixed; changed = true; }
      if (currentFixed && st.activeUntil !== currentFixed.endAt) { st.activeUntil = currentFixed.endAt; changed = true; }
      const localNow = new Date(Utilities.formatDate(now, Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyy/MM/dd HH:mm:ss'));
      let due = st.nextPaymentDate ? new Date(String(st.nextPaymentDate).slice(0,10) + 'T00:00:00') : new Date(localNow.getFullYear(), localNow.getMonth(), day, 0, 0, 0, 0);
      if (isNaN(due.getTime())) due = new Date(localNow.getFullYear(), localNow.getMonth(), day, 0, 0, 0, 0);
      const daysLeft = Math.ceil((due.getTime() - localNow.getTime()) / 86400000);
      const reminder = daysLeft === 3 && cyclesDone < limit && !hasPendingFee;
      if (st.monthlyReminderDue !== reminder) { st.monthlyReminderDue = reminder; changed = true; }
      if (cyclesDone >= limit && st.status !== 'cycle_limit_completed') { st.status = 'cycle_limit_completed'; changed = true; }
      return;
    }
    const periods = Array.isArray(st.feePeriods) ? st.feePeriods : [];
    if (!periods.length) return; // preserve legacy student records without fee periods
    const valid = periods
      .filter(p => p && !p.reversedAt && p.startAt && p.endAt)
      .sort((a,b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());
    if (!valid.length) return;
    const current = valid.find(p => new Date(p.startAt).getTime() <= now.getTime() && new Date(p.endAt).getTime() > now.getTime());
    const latest = valid[valid.length - 1];
    const hasPendingFee = Array.isArray(state.feeRequests) && state.feeRequests.some(q => q && q.studentId === st.id && q.status === 'pending');
    const forceStart = st.forceActiveStart ? new Date(String(st.forceActiveStart).slice(0,10)+'T00:00:00') : null;
    const forceEnd = st.forceActiveEnd ? new Date(String(st.forceActiveEnd).slice(0,10)+'T23:59:59.999') : null;
    const forceNow = st.forceActive === true && st.adminPaused !== true && forceStart && forceEnd && now >= forceStart && now <= forceEnd;
    const newActive = st.adminPaused === true ? false : (forceNow || (!hasPendingFee && !!current));
    if (st.courseAccessActive !== newActive) { st.courseAccessActive = newActive; changed = true; }
    if (st.activeUntil !== latest.endAt) { st.activeUntil = latest.endAt; changed = true; }
    if (current && st.adminPaused !== true) {
      const elapsed = Math.floor((now.getTime() - new Date(current.startAt).getTime()) / 86400000);
      const due = elapsed === 27 && now.getTime() < new Date(current.endAt).getTime() && !hasPendingFee;
      if (st.monthlyReminderDue !== due) { st.monthlyReminderDue = due; changed = true; }
      if (due && st.monthlyReminderFor !== current.requestId) { st.monthlyReminderFor = current.requestId || current.startAt; changed = true; }
    } else if (st.monthlyReminderDue) {
      st.monthlyReminderDue = false; changed = true;
    }
  });
  if (changed) writeState_(state);
  return changed ? 'GWC fee expiry/reminder flags updated.' : 'No fee status changes required.';
}
