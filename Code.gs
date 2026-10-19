/**
 * GWC Google Apps Script backend starter.
 * Deploy as Web App (Execute as: Me; access: Anyone) for browser calls.
 * IMPORTANT: this starter endpoint is public. Do NOT store real student personal/payment data
 * until access control is added and tested. Drive uploads below are link-accessible.
 */
const GWC_SHEET_NAME = 'GWC_Storage';
const GWC_CHUNK_SIZE = 40000;
const GWC_FOLDER_NAME = 'GWC_Uploads';

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'load';
  if (action === 'load') {
    const state = readState_();
    return json_({ok:true, state:state});
  }
  return json_({ok:false,error:'Unknown action'});
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw) return json_({ok:false,error:'Missing request body'});
    const payload = JSON.parse(raw);
    if (payload.action === 'save') {
      if (!payload.state || typeof payload.state !== 'object') throw new Error('Invalid state');
      writeState_(payload.state);
      return json_({ok:true,savedAt:new Date().toISOString()});
    }
    if (payload.action === 'upload') {
      return json_(uploadFile_(payload));
    }
    return json_({ok:false,error:'Unknown action'});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('GWC_SPREADSHEET_ID');
  let ss;
  if (id) {
    try { ss = SpreadsheetApp.openById(id); } catch (e) {}
  }
  if (!ss) {
    ss = SpreadsheetApp.create('GWC Website Cloud Data');
    props.setProperty('GWC_SPREADSHEET_ID', ss.getId());
  }
  let sh = ss.getSheetByName(GWC_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(GWC_SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(['chunk_index','json_chunk','updated_at']);
  return sh;
}

function readState_() {
  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return null;
  const rows = sh.getRange(2,1,last-1,3).getValues()
    .filter(r => r[1] !== '' && r[1] !== null)
    .sort((a,b) => Number(a[0])-Number(b[0]));
  if (!rows.length) return null;
  const raw = rows.map(r => String(r[1])).join('');
  return JSON.parse(raw);
}

function writeState_(state) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = getSheet_();
    const raw = JSON.stringify(state);
    const chunks = [];
    for (let i=0; i<raw.length; i+=GWC_CHUNK_SIZE) chunks.push(raw.slice(i,i+GWC_CHUNK_SIZE));
    sh.clearContents();
    sh.getRange(1,1,1,3).setValues([['chunk_index','json_chunk','updated_at']]);
    if (chunks.length) {
      const now = new Date();
      sh.getRange(2,1,chunks.length,3).setValues(chunks.map((c,i)=>[i,c,now]));
    }
    sh.setFrozenRows(1);
  } finally {
    lock.releaseLock();
  }
}

function uploadFile_(p) {
  if (!p.dataUrl || !p.name) throw new Error('Missing file data');
  const match = String(p.dataUrl).match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid file data');
  const bytes = Utilities.base64Decode(match[2]);
  if (bytes.length > 1000000) throw new Error('File must be smaller than 1 MB');
  const mime = String(p.mimeType || match[1] || 'application/octet-stream');
  const allowed = ['image/jpeg','image/png','image/webp','image/gif','application/pdf'];
  if (allowed.indexOf(mime) === -1) throw new Error('Only JPG, PNG, WEBP, GIF and PDF files are allowed');
  const folder = getFolder_();
  const blob = Utilities.newBlob(bytes, mime, safeName_(p.name));
  const file = folder.createFile(blob);
  // NOTE: Public link is convenient for a static site but not suitable for private payment slips.
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const id = file.getId();
  return {ok:true,fileId:id,url:'https://drive.google.com/uc?export=view&id='+encodeURIComponent(id),name:file.getName()};
}

function getFolder_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('GWC_DRIVE_FOLDER_ID');
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) {}
  }
  const folder = DriveApp.createFolder(GWC_FOLDER_NAME);
  props.setProperty('GWC_DRIVE_FOLDER_ID', folder.getId());
  return folder;
}

function safeName_(name) {
  return String(name).replace(/[\\\\/:*?"<>|#%{}~&]/g,'_').slice(0,120) || 'gwc-file';
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
