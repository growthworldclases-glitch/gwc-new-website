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
const GWC_CHUNK_SIZE = 40000;
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
function readState_() {
  const sh = getSheet_(), last = sh.getLastRow();
  if (last < 2) throw new Error('GWC_Storage has no saved state. Refusing to initialize or overwrite empty data.');
  const rows = sh.getRange(2,1,last-1,3).getDisplayValues().filter(r => r[1] !== '' && r[1] !== null).sort((a,b) => Number(a[0])-Number(b[0]));
  if (!rows.length) throw new Error('No JSON chunks found in GWC_Storage. Existing data was not overwritten.');
  const raw = rows.map(r => String(r[1])).join('');
  let state; try { state=JSON.parse(raw); } catch(e) { throw new Error('GWC saved JSON is invalid. Existing data was preserved; restore a valid Sheet version or backup. Details: '+e.message); }
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('Saved JSON root is not a state object. Existing data preserved.');
  return state;
}
function writeState_(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) throw new Error('Refusing to save invalid state object.');
  const raw = JSON.stringify(state);
  let parsed; try { parsed=JSON.parse(raw); } catch(e) { throw new Error('New state failed JSON validation; not saved.'); }
  const chunks=[]; for(let i=0;i<raw.length;i+=GWC_CHUNK_SIZE) chunks.push(raw.slice(i,i+GWC_CHUNK_SIZE));
  const lock=LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh=getSheet_(), ss=sh.getParent();
    // Read and validate current state before any mutation; do not overwrite a damaged primary.
    const oldRaw=sh.getLastRow()>1 ? sh.getRange(2,1,sh.getLastRow()-1,3).getDisplayValues().filter(r=>r[1]!==''&&r[1]!==null).sort((a,b)=>Number(a[0])-Number(b[0])).map(r=>String(r[1])).join('') : '';
    if(oldRaw) { try { const old=JSON.parse(oldRaw); if(!old||typeof old!=='object'||Array.isArray(old)) throw new Error('bad root'); } catch(e) { throw new Error('Primary JSON is invalid. Refusing to overwrite it; restore a valid version first.'); } }
    // Snapshot the last valid state into a separate versioned backup sheet before replacing.
    if(oldRaw) {
      // One versioned snapshot per day avoids creating a new spreadsheet tab on every save.
      // The first valid state of the day is retained; never overwrite that day's backup.
      const stamp=Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Kolkata', 'yyyyMMdd');
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
    // Stage and verify the exact next state first.
    let stage=ss.getSheetByName('GWC_Storage_Stage'); if(!stage) stage=ss.insertSheet('GWC_Storage_Stage');
    const now=new Date(), stageRows=[['chunk_index','json_chunk','updated_at'],...chunks.map((c,i)=>[String(i),c,now])];
    stage.clearContents(); stage.getRange(1,1,stageRows.length,3).setNumberFormat('@'); stage.getRange(1,1,stageRows.length,3).setValues(stageRows);
    const staged=stage.getRange(2,1,chunks.length,3).getDisplayValues().map(r=>r[1]).join('');
    if(staged!==raw || JSON.stringify(JSON.parse(staged))!==JSON.stringify(parsed)) throw new Error('Staging verification failed. Primary data was not changed.');
    sh.clearContents(); sh.getRange(1,1,stageRows.length,3).setNumberFormat('@'); sh.getRange(1,1,stageRows.length,3).setValues(stageRows); sh.setFrozenRows(1);
    const finalRaw=sh.getRange(2,1,chunks.length,3).getDisplayValues().map(r=>r[1]).join('');
    if(finalRaw!==raw) throw new Error('Post-save verification failed. Restore from GWC_Storage_Backup if required.');
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
  let changed = false;
  state.students.forEach(st => {
    // New fixed-date cycle records: keep access only while an approved monthly period is current.
    // Legacy records without monthlyPaymentDate continue through the original validity logic below.
    if (st && st.monthlyPaymentDate) {
      const day = Math.min(28, Math.max(1, Number(st.monthlyPaymentDate) || 5));
      const periodsFixed = Array.isArray(st.feePeriods) ? st.feePeriods : [];
      const currentFixed = periodsFixed.filter(p => p && p.startAt && p.endAt &&
        new Date(p.startAt).getTime() <= now.getTime() && new Date(p.endAt).getTime() > now.getTime())
        .sort((a,b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime())[0] || null;
      const limit = Math.max(1, Number(st.totalCycles) || 1200);
      const cyclesDone = Math.max(0, Number(st.approvedCycles) || 0);
      const activeFixed = st.adminPaused !== true && cyclesDone < limit && !!currentFixed;
      if (st.courseAccessActive !== activeFixed) { st.courseAccessActive = activeFixed; changed = true; }
      if (currentFixed && st.activeUntil !== currentFixed.endAt) { st.activeUntil = currentFixed.endAt; changed = true; }
      const due = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0, 0);
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / 86400000);
      const reminder = daysLeft >= 0 && daysLeft <= 3 && cyclesDone < limit;
      if (st.monthlyReminderDue !== reminder) { st.monthlyReminderDue = reminder; changed = true; }
      if (cyclesDone >= limit && st.status !== 'cycle_limit_completed') { st.status = 'cycle_limit_completed'; changed = true; }
      return;
    }
    const periods = Array.isArray(st.feePeriods) ? st.feePeriods : [];
    if (!periods.length) return; // preserve legacy student records without fee periods
    const valid = periods
      .filter(p => p && p.startAt && p.endAt)
      .sort((a,b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime());
    if (!valid.length) return;
    const current = valid.find(p => new Date(p.startAt).getTime() <= now.getTime() && new Date(p.endAt).getTime() > now.getTime());
    const latest = valid[valid.length - 1];
    const newActive = st.adminPaused === true ? false : !!current;
    if (st.courseAccessActive !== newActive) { st.courseAccessActive = newActive; changed = true; }
    if (st.activeUntil !== latest.endAt) { st.activeUntil = latest.endAt; changed = true; }
    if (current && st.adminPaused !== true) {
      const elapsed = Math.floor((now.getTime() - new Date(current.startAt).getTime()) / 86400000);
      const due = elapsed >= 28 && now.getTime() < new Date(current.endAt).getTime();
      if (st.monthlyReminderDue !== due) { st.monthlyReminderDue = due; changed = true; }
      if (due && st.monthlyReminderFor !== current.requestId) { st.monthlyReminderFor = current.requestId || current.startAt; changed = true; }
    } else if (st.monthlyReminderDue) {
      st.monthlyReminderDue = false; changed = true;
    }
  });
  if (changed) writeState_(state);
  return changed ? 'GWC fee expiry/reminder flags updated.' : 'No fee status changes required.';
}
