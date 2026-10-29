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

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || 'load').toLowerCase();
  if (action === 'health' || action === 'ping') return json_({ok:true,service:'GWC Apps Script',time:new Date().toISOString()});
  if (['load','get','getstate','loadstate','read','loadmeta','meta','metadata'].indexOf(action) >= 0) {
    try { var st = readState_(); return json_({ok:true,state:st,meta:{service:'GWC Apps Script',version:'safe-json-repair-2026-10',hasState:!!st,serverTime:new Date().toISOString()}}); }
    catch (err) { return json_({ok:false,error:String(err && err.message || err)}); }
  }
  return json_({ok:false,error:'Unknown GET action: ' + action, supported:['health','load']});
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
    if (action === 'archivefile') return json_(archiveDriveFile_(payload));
    if (action === 'health' || action === 'ping') return json_({ok:true,service:'GWC Apps Script',time:new Date().toISOString()});
    throw new Error('Unknown POST action: ' + action);
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('GWC_SPREADSHEET_ID');
  let ss;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); }
    catch (e) { throw new Error('Configured GWC_SPREADSHEET_ID could not be opened. Existing data was NOT replaced and no new spreadsheet was created. Check Script Properties and access.'); }
  } else {
    // Only first-time setup creates a sheet. Never silently switch away from a configured ID.
    ss = SpreadsheetApp.create('GWC Website Cloud Data');
    props.setProperty('GWC_SPREADSHEET_ID', ss.getId());
  }
  let sh = ss.getSheetByName(GWC_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(GWC_SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(['chunk_index','json_chunk','updated_at']);
  return sh;
}
function readState_() {
  const sh = getSheet_(), last = sh.getLastRow();
  if (last < 2) return null;
  const allRows = sh.getRange(2,1,last-1,3).getValues();
  let rows = allRows.filter(r => r[1] !== '' && r[1] !== null)
    .sort((a,b) => Number(a[0])-Number(b[0]));
  if (!rows.length) {
    // Compatibility with legacy sheets that stored the whole JSON in column A.
    const legacy = allRows.map(r => r[0]).filter(v => v !== '' && v !== null).map(String);
    if (legacy.length) {
      try { return JSON.parse(legacy.join('')); } catch (ignoreLegacy) {}
    }
    return null;
  }

  // Current chunk format: one ordered chunk per row. Never overwrite the current
  // sheet merely because parsing failed; try the older column-A layout and backups.
  const joined = rows.map(r => String(r[1])).join('');
  try { return JSON.parse(joined); }
  catch (primaryError) {
    const legacy = allRows.map(r => r[0]).filter(v => v !== '' && v !== null).map(String);
    if (legacy.length) { try { return JSON.parse(legacy.join('')); } catch (ignoreLegacy) {} }
    // Try intact backup snapshots created by writeState_ before the last update.
    const ss = sh.getParent();
    const backups = ss.getSheets()
      .filter(x => /^GWC_Storage_BACKUP_/.test(x.getName()))
      .sort((a,b) => b.getName().localeCompare(a.getName()));
    for (const bk of backups) {
      try {
        const n = bk.getLastRow();
        if (n < 2) continue;
        const br = bk.getRange(2,1,n-1,3).getValues()
          .filter(r => r[1] !== '' && r[1] !== null)
          .sort((a,b) => Number(a[0])-Number(b[0]));
        const candidate = br.map(r => String(r[1])).join('');
        const parsed = JSON.parse(candidate);
        // Return backup state, but don't silently overwrite the damaged primary data.
        return parsed;
      } catch (ignore) {}
    }
    throw new Error('GWC saved JSON is invalid and no valid automatic backup was found. Primary data was preserved; restore from an earlier valid backup before saving.');
  }
}

function writeState_(state) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = getSheet_(), ss = sh.getParent(), raw = JSON.stringify(state), chunks = [];
    if (typeof raw !== 'string' || !raw.length) throw new Error('State could not be serialized');
    for (let i=0; i<raw.length; i+=GWC_CHUNK_SIZE) chunks.push(raw.slice(i,i+GWC_CHUNK_SIZE));
    // Validate serialization and chunk reconstruction before touching the live sheet.
    if (JSON.stringify(JSON.parse(chunks.join(''))) !== raw) throw new Error('State validation failed; live data was not changed');

    // Keep a timestamped backup of the current sheet before replacing any live rows.
    // Backup names are unique and the sheet is never cleared by this process.
    if (sh.getLastRow() > 1) {
      const backupName = ('GWC_Storage_BACKUP_' + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss'))
        .slice(0,99);
      if (!ss.getSheetByName(backupName)) {
        const bk = ss.insertSheet(backupName);
        const old = sh.getDataRange().getValues();
        if (old.length && old[0].length) bk.getRange(1,1,old.length,old[0].length).setValues(old);
        bk.setFrozenRows(1);
      }
    }

    // Stage chunks on a temporary sheet and read them back before swapping live data.
    const stageName = 'GWC_Storage_STAGE';
    let stage = ss.getSheetByName(stageName);
    if (!stage) stage = ss.insertSheet(stageName);
    stage.clearContents();
    stage.getRange(1,1,1,3).setValues([['chunk_index','json_chunk','updated_at']]);
    const now = new Date();
    if (chunks.length) stage.getRange(2,1,chunks.length,3).setValues(chunks.map((c,i)=>[i,c,now]));
    const check = stage.getRange(2,2,chunks.length,1).getValues().map(r=>String(r[0])).join('');
    JSON.parse(check); // throws before live sheet is modified if staging is invalid

    sh.clearContents();
    sh.getRange(1,1,1,3).setValues([['chunk_index','json_chunk','updated_at']]);
    if (chunks.length) sh.getRange(2,1,chunks.length,3).setValues(chunks.map((c,i)=>[i,c,now]));
    sh.setFrozenRows(1);
    // Keep a bounded set of recent recovery snapshots to avoid filling the workbook forever.
    const oldBackups = ss.getSheets().filter(x => /^GWC_Storage_BACKUP_/.test(x.getName()))
      .sort((a,b) => b.getName().localeCompare(a.getName()));
    oldBackups.slice(20).forEach(bk => { try { ss.deleteSheet(bk); } catch (ignorePrune) {} });
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
function getFolder_() {
  const props = PropertiesService.getScriptProperties(); let id = props.getProperty('GWC_DRIVE_FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); }
    catch (e) { throw new Error('Configured GWC_DRIVE_FOLDER_ID could not be opened. Existing Drive folder was not replaced. Check Script Properties and access.'); }
  }
  const folder = DriveApp.createFolder(GWC_FOLDER_NAME); props.setProperty('GWC_DRIVE_FOLDER_ID', folder.getId()); return folder;
}
function archiveDriveFile_(p) {
  const id = String(p.fileId || '').trim();
  if (!id) throw new Error('Missing Drive file ID');
  const file = DriveApp.getFileById(id);
  const props = PropertiesService.getScriptProperties();
  let folderId = props.getProperty('GWC_DELETED_FOLDER_ID');
  let folder;
  if (folderId) {
    try { folder = DriveApp.getFolderById(folderId); }
    catch (e) { throw new Error('Configured GWC_DELETED_FOLDER_ID could not be opened; no file was moved.'); }
  } else {
    folder = DriveApp.createFolder('GWC_Deleted_Items');
    props.setProperty('GWC_DELETED_FOLDER_ID', folder.getId());
  }
  file.moveTo(folder);
  return {ok:true, archived:true, fileId:id, folderName:folder.getName()};
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
      const periodsFixed = Array.isArray(st.feePeriods) ? st.feePeriods : [];
      const dueRaw = st.nextFeePaymentDate ? new Date(st.nextFeePaymentDate + 'T00:00:00') : null;
      const currentFixed = periodsFixed.filter(p => p && p.startAt && p.endAt &&
        new Date(p.startAt).getTime() <= now.getTime() && new Date(p.endAt).getTime() > now.getTime())
        .sort((a,b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime())[0] || null;
      const limit = Math.max(1, Number(st.totalCycles) || 1200);
      const cyclesDone = Math.max(0, Number(st.approvedCycles) || 0);
      const activeFixed = st.adminPaused !== true && cyclesDone < limit && !!currentFixed;
      if (st.courseAccessActive !== activeFixed) { st.courseAccessActive = activeFixed; changed = true; }
      if (currentFixed && st.activeUntil !== currentFixed.endAt) { st.activeUntil = currentFixed.endAt; changed = true; }
      const due = dueRaw && !isNaN(dueRaw.getTime()) ? dueRaw : (currentFixed ? new Date(currentFixed.endAt) : null);
      const daysLeft = due ? Math.ceil((due.getTime() - now.getTime()) / 86400000) : 9999;
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
