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
    if (action === 'health' || action === 'ping') return json_({ok:true,service:'GWC Apps Script',time:new Date().toISOString()});
    throw new Error('Unknown POST action: ' + action);
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

/**
 * Read the active JSON state safely. If active chunks are damaged, attempt recovery
 * from the last known-good snapshot. Never silently return an empty state on corruption.
 */
function readState_() {
  const ss = getSpreadsheet_();
  const sh = getStorageSheet_(ss, GWC_SHEET_NAME);
  const active = readChunkSheet_(sh);
  if (active.ok) return active.state;

  const backup = ss.getSheetByName('GWC_Storage_Backup');
  if (backup) {
    const recovered = readChunkSheet_(backup);
    if (recovered.ok && recovered.state !== null && recovered.raw !== 'null') {
      // Restore only after the backup has been completely parsed and validated.
      writeChunksToSheet_(sh, recovered.raw);
      return recovered.state;
    }
  }
  throw new Error('GWC saved JSON is invalid (' + active.error +
    '). Original sheet was NOT cleared. No valid GWC_Storage_Backup was found; keep this sheet unchanged and restore from a Google Sheets/Drive version history or a known-good backup before saving.');
}

/** Obtain the existing spreadsheet by its saved Script Property; never create a new one
 * when the configured ID is present but temporarily inaccessible. */
function getSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('GWC_SPREADSHEET_ID');
  if (id) {
    try { return SpreadsheetApp.openById(id); }
    catch (e) { throw new Error('Cannot open configured GWC spreadsheet. Existing data was not replaced. Check GWC_SPREADSHEET_ID and permissions: ' + e.message); }
  }
  const ss = SpreadsheetApp.create('GWC Website Cloud Data');
  props.setProperty('GWC_SPREADSHEET_ID', ss.getId());
  return ss;
}

function getStorageSheet_(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1,1,1,3).setValues([['chunk_index','json_chunk','updated_at']]);
    sh.setFrozenRows(1);
  }
  if (sh.getLastRow() === 0) {
    sh.getRange(1,1,1,3).setValues([['chunk_index','json_chunk','updated_at']]);
    sh.setFrozenRows(1);
  }
  return sh;
}

function readChunkSheet_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return {ok:true, state:null, raw:'null'};
  const rows = sh.getRange(2,1,last-1,3).getValues()
    .filter(r => r[1] !== '' && r[1] !== null)
    .sort((a,b) => Number(a[0])-Number(b[0]));
  if (!rows.length) return {ok:true, state:null, raw:'null'};
  // Verify contiguous chunk indexes. Missing/duplicated chunks can otherwise corrupt JSON.
  for (let i=0; i<rows.length; i++) {
    if (Number(rows[i][0]) !== i) {
      return {ok:false, error:'missing or duplicated JSON chunk at index ' + i};
    }
  }
  const raw = rows.map(r => String(r[1])).join('');
  try {
    const state = JSON.parse(raw);
    if (state !== null && (typeof state !== 'object' || Array.isArray(state))) {
      return {ok:false, error:'saved state is not a JSON object'};
    }
    return {ok:true, state:state, raw:raw};
  } catch (e) {
    return {ok:false, error:String(e && e.message || e)};
  }
}

/**
 * Transaction-like save:
 * 1) validate serialized JSON;
 * 2) preserve last valid active state as backup;
 * 3) write and verify staging sheet;
 * 4) replace active sheet only after staging validates.
 * Chunk size stays below Google Sheets' 50,000-character cell limit.
 */
function writeState_(state) {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const raw = JSON.stringify(state);
    if (!raw || raw.length === 0) throw new Error('State could not be serialized');
    const verifiedInput = JSON.parse(raw);
    if (!verifiedInput || typeof verifiedInput !== 'object' || Array.isArray(verifiedInput)) {
      throw new Error('Refusing to save invalid GWC state object');
    }

    const ss = getSpreadsheet_();
    const active = getStorageSheet_(ss, GWC_SHEET_NAME);
    const current = readChunkSheet_(active);

    // Keep a copy of the last valid active state. Never overwrite a good backup
    // with data from an already-corrupt active sheet.
    if (current.ok && current.raw !== 'null') {
      const backup = getStorageSheet_(ss, 'GWC_Storage_Backup');
      writeChunksToSheet_(backup, current.raw);
    }

    const staging = getStorageSheet_(ss, 'GWC_Storage_Staging');
    writeChunksToSheet_(staging, raw);
    const staged = readChunkSheet_(staging);
    if (!staged.ok) throw new Error('Staged GWC JSON verification failed: ' + staged.error);
    writeChunksToSheet_(active, staged.raw);

    const finalCheck = readChunkSheet_(active);
    if (!finalCheck.ok) throw new Error('Saved GWC JSON verification failed: ' + finalCheck.error);
  } finally {
    lock.releaseLock();
  }
}

function writeChunksToSheet_(sh, raw) {
  // Keep each cell safely under Sheets' 50,000-character limit.
  const chunkSize = 30000;
  const chunks = [];
  for (let i=0; i<raw.length; i+=chunkSize) chunks.push(raw.slice(i, i+chunkSize));
  // Write all chunks into a temporary in-memory list and validate before touching sheet.
  const now = new Date();
  const rows = chunks.map((c,i) => [i,c,now]);
  // This sheet is either backup, staging, or active. Clear only after caller has
  // validated the source string and (for active) staged it successfully.
  sh.clearContents();
  sh.getRange(1,1,1,3).setValues([['chunk_index','json_chunk','updated_at']]);
  if (rows.length) sh.getRange(2,1,rows.length,3).setValues(rows);
  sh.setFrozenRows(1);
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
