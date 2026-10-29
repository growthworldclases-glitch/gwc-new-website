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
  if (['load','get','getstate','loadstate','read'].indexOf(action) >= 0) {
    try { return json_({ok:true,state:readState_()}); }
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
    if (['archivefile','deletefile'].indexOf(action) >= 0) return json_(archiveDriveFile_(payload));
    if (action === 'restorefile') return json_(restoreDriveFile_(payload));
    if (action === 'health' || action === 'ping') return json_({ok:true,service:'GWC Apps Script',time:new Date().toISOString()});
    throw new Error('Unknown POST action: ' + action);
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('GWC_SPREADSHEET_ID');
  let ss;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); }
    catch (e) { throw new Error('Existing GWC spreadsheet could not be opened. Data was not replaced. Check GWC_SPREADSHEET_ID permissions: ' + String(e.message || e)); }
  } else {
    ss = SpreadsheetApp.create('GWC Website Cloud Data');
    props.setProperty('GWC_SPREADSHEET_ID', ss.getId());
  }
  let sh = ss.getSheetByName(GWC_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(GWC_SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(['chunk_index','json_chunk','updated_at']);
  return sh;
}

/**
 * Strict reader: never silently drops a missing/duplicate chunk. The old reader filtered
 * empty rows and concatenated everything, which could turn partial storage into bad JSON.
 */
function readState_() {
  const sh = getSheet_(), last = sh.getLastRow();
  if (last < 2) return null;
  const rows = sh.getRange(2,1,last-1,3).getValues();
  const chunks = [];
  rows.forEach((r, rowOffset) => {
    if (r[1] === '' || r[1] === null) return;
    const idx = Number(r[0]);
    if (!Number.isInteger(idx) || idx < 0) throw new Error('GWC storage integrity error: invalid chunk_index at sheet row ' + (rowOffset + 2) + '. Data left unchanged.');
    if (chunks[idx] !== undefined) throw new Error('GWC storage integrity error: duplicate chunk ' + idx + '. Data left unchanged.');
    chunks[idx] = String(r[1]);
  });
  if (!chunks.length) return null;
  for (let i=0; i<chunks.length; i++) {
    if (typeof chunks[i] !== 'string') throw new Error('GWC storage integrity error: missing chunk ' + i + ' of ' + chunks.length + '. Data left unchanged.');
  }
  const raw = chunks.join('');
  try { return JSON.parse(raw); }
  catch (err) {
    const msg = String(err && err.message || err);
    throw new Error('GWC saved JSON is invalid (' + msg + '). Existing sheet data was preserved; run GWC diagnostics/restore before saving new state.');
  }
}

/** Keep a Drive/Sheets-side snapshot of the previous raw chunks before replacing them. */
function backupCurrentChunks_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return;
  const rows = sh.getRange(2,1,last-1,3).getValues();
  if (!rows.some(r => r[1] !== '' && r[1] !== null)) return;
  const ss = sh.getParent();
  let backup = ss.getSheetByName('GWC_Storage_Backups');
  if (!backup) {
    backup = ss.insertSheet('GWC_Storage_Backups');
    backup.appendRow(['backup_id','chunk_index','json_chunk','updated_at']);
    backup.setFrozenRows(1);
  }
  const now = new Date();
  const backupLast = backup.getLastRow();
  if (backupLast > 1) {
    const lastStamp = backup.getRange(backupLast,4).getValue();
    if (lastStamp instanceof Date && now.getTime() - lastStamp.getTime() < 15*60*1000) return; // avoid a full copy on every autosave
  }
  const backupId = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss') + '_' + Utilities.getUuid().slice(0,8);
  const values = rows.filter(r => r[1] !== '' && r[1] !== null).map(r => [backupId, r[0], String(r[1]), now]);
  if (values.length) backup.getRange(backup.getLastRow()+1,1,values.length,4).setValues(values);
  // Retain at most the latest 10 snapshots so backups do not grow without limit.
  const bLast = backup.getLastRow();
  if (bLast > 1) {
    const allIds = backup.getRange(2,1,bLast-1,1).getValues().map(r=>String(r[0]));
    const uniqueIds = Array.from(new Set(allIds));
    if (uniqueIds.length > 10) {
      const keep = new Set(uniqueIds.slice(-10));
      for (let i=allIds.length-1; i>=0; i--) if (!keep.has(allIds[i])) backup.deleteRow(i+2);
    }
  }
}

/**
 * Validate first, snapshot previous raw chunks, write new chunks, and verify after writing.
 * If the write fails, restore the previous rows from the in-memory snapshot.
 */
function writeState_(state) {
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  let sh = null, oldRows = null, oldHeader = null;
  try {
    const raw = JSON.stringify(state);
    if (typeof raw !== 'string' || !raw.length) throw new Error('State serialization produced no JSON.');
    JSON.parse(raw); // preflight validation before touching existing records
    const chunks = [];
    for (let i=0; i<raw.length; i+=GWC_CHUNK_SIZE) chunks.push(raw.slice(i,i+GWC_CHUNK_SIZE));
    sh = getSheet_();
    const last = sh.getLastRow();
    oldHeader = sh.getRange(1,1,1,3).getValues()[0];
    oldRows = last > 1 ? sh.getRange(2,1,last-1,3).getValues() : [];
    backupCurrentChunks_(sh);
    sh.clearContents();
    sh.getRange(1,1,1,3).setValues([['chunk_index','json_chunk','updated_at']]);
    if (chunks.length) {
      const now = new Date();
      sh.getRange(2,1,chunks.length,3).setValues(chunks.map((c,i)=>[i,c,now]));
    }
    sh.setFrozenRows(1);
    SpreadsheetApp.flush();
    const checkRows = chunks.length ? sh.getRange(2,1,chunks.length,3).getValues() : [];
    const checkRaw = checkRows.map(r => String(r[1])).join('');
    const verified = JSON.parse(checkRaw || 'null');
    if (!verified || typeof verified !== 'object') throw new Error('Post-save verification failed: saved state is not an object.');
  } catch (err) {
    if (sh && oldRows !== null) {
      try {
        sh.clearContents();
        sh.getRange(1,1,1,3).setValues([oldHeader && oldHeader.length === 3 ? oldHeader : ['chunk_index','json_chunk','updated_at']]);
        if (oldRows.length) sh.getRange(2,1,oldRows.length,3).setValues(oldRows);
        SpreadsheetApp.flush();
      } catch (restoreErr) {
        throw new Error('Save failed and automatic rollback also failed. Do not delete GWC_Storage_Backups. Save error: ' + String(err.message || err) + '; rollback error: ' + String(restoreErr.message || restoreErr));
      }
    }
    throw new Error('Safe save failed; previous sheet rows were restored where possible. ' + String(err.message || err));
  } finally {
    lock.releaseLock();
  }
}

/** Run manually from the Apps Script editor to inspect current storage without changing it. */
function diagnoseGwcStorage() {
  const sh = getSheet_();
  const last = sh.getLastRow();
  const rows = last > 1 ? sh.getRange(2,1,last-1,3).getValues() : [];
  const indexes = rows.filter(r => r[1] !== '' && r[1] !== null).map(r => Number(r[0])).sort((a,b)=>a-b);
  const missing = [];
  for (let i=0; i<indexes.length; i++) if (indexes[i] !== i) missing.push(i);
  let jsonValid = false, jsonError = '';
  try { readState_(); jsonValid = true; } catch(e) { jsonError = String(e.message || e); }
  return {spreadsheetId:sh.getParent().getId(),sheet:GWC_SHEET_NAME,rows:last,chunkCount:indexes.length,missingChunks:missing.slice(0,100),jsonValid:jsonValid,error:jsonError,backupSheetExists:!!sh.getParent().getSheetByName('GWC_Storage_Backups')};
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
/**
 * Move deleted/replaced Drive uploads into a dedicated archive folder instead of
 * permanently deleting them. Accepts a Drive file ID or a known Drive URL.
 */
function archiveDriveFile_(p) {
  const raw = String(p.fileId || p.url || '').trim();
  const match = raw.match(/[-\w]{25,}/);
  if (!match) throw new Error('Valid Google Drive file ID/URL is required.');
  const fileId = match[0];
  const file = DriveApp.getFileById(fileId);
  const props = PropertiesService.getScriptProperties();
  const sourceFolderId = props.getProperty('GWC_DRIVE_FOLDER_ID');
  const existingDeletedId = props.getProperty('GWC_DELETED_FOLDER_ID');
  let allowedParent = false;
  const parents = file.getParents();
  while (parents.hasNext()) {
    const parentId = parents.next().getId();
    if ((sourceFolderId && parentId === sourceFolderId) || (existingDeletedId && parentId === existingDeletedId)) allowedParent = true;
  }
  if (!allowedParent) throw new Error('For safety, only files inside the GWC upload/archive folders can be archived.');
  let folder, folderId = existingDeletedId;
  if (folderId) { try { folder = DriveApp.getFolderById(folderId); } catch(e) {} }
  if (!folder) {
    folder = DriveApp.createFolder('GWC_Deleted_Items');
    props.setProperty('GWC_DELETED_FOLDER_ID', folder.getId());
  }
  file.moveTo(folder);
  return {ok:true,archived:true,fileId:fileId,folderName:'GWC_Deleted_Items'};
}
function restoreDriveFile_(p) {
  const raw = String(p.fileId || p.url || '').trim();
  const match = raw.match(/[-\w]{25,}/);
  if (!match) throw new Error('Valid Google Drive file ID/URL is required.');
  const file = DriveApp.getFileById(match[0]);
  const props = PropertiesService.getScriptProperties();
  const deletedId = props.getProperty('GWC_DELETED_FOLDER_ID');
  let isArchived = false;
  const parents = file.getParents();
  while (parents.hasNext()) if (deletedId && parents.next().getId() === deletedId) isArchived = true;
  if (!isArchived) throw new Error('Only files inside GWC_Deleted_Items can be restored.');
  file.moveTo(getFolder_());
  return {ok:true,restored:true,fileId:match[0]};
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
      let due = new Date(now.getFullYear(), now.getMonth(), day, 0, 0, 0, 0);
      if (now.getTime() >= due.getTime()) due = new Date(now.getFullYear(), now.getMonth()+1, day, 0, 0, 0, 0);
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
