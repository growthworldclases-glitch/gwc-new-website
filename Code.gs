/**
 * GWC Google Apps Script backend.
 * Deploy as Web App: Execute as Me; access Anyone (required by this static/proxy setup).
 * IMPORTANT: this public endpoint is NOT safe for private student/payment records until
 * authentication and authorization are implemented and tested. Drive uploads are link-viewable.
 */
const GWC_SHEET_NAME = 'GWC_Storage';
const GWC_CHUNK_SIZE = 40000;
const GWC_FOLDER_NAME = 'GWC_Uploads';

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'load';
  if (action === 'health') return json_({ok:true,service:'GWC Apps Script',time:new Date().toISOString()});
  if (action === 'load') {
    try { return json_({ok:true, state:readState_()}); }
    catch (err) { return json_({ok:false,error:String(err && err.message || err)}); }
  }
  return json_({ok:false,error:'Unknown action'});
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents;
    if (!raw) throw new Error('Missing request body');
    const payload = JSON.parse(raw);
    if (payload.action === 'save') {
      if (!payload.state || typeof payload.state !== 'object' || Array.isArray(payload.state)) throw new Error('Invalid state');
      writeState_(payload.state);
      return json_({ok:true,savedAt:new Date().toISOString()});
    }
    if (payload.action === 'upload') return json_(uploadFile_(payload));
    throw new Error('Unknown action');
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function getSheet_() {
  const props = PropertiesService.getScriptProperties();
  let id = props.getProperty('GWC_SPREADSHEET_ID');
  let ss;
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) {} }
  if (!ss) { ss = SpreadsheetApp.create('GWC Website Cloud Data'); props.setProperty('GWC_SPREADSHEET_ID', ss.getId()); }
  let sh = ss.getSheetByName(GWC_SHEET_NAME);
  if (!sh) sh = ss.insertSheet(GWC_SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(['chunk_index','json_chunk','updated_at']);
  return sh;
}
function readState_() {
  const sh = getSheet_(), last = sh.getLastRow();
  if (last < 2) return null;
  const rows = sh.getRange(2,1,last-1,3).getValues().filter(r => r[1] !== '' && r[1] !== null).sort((a,b) => Number(a[0])-Number(b[0]));
  if (!rows.length) return null;
  return JSON.parse(rows.map(r => String(r[1])).join(''));
}
function writeState_(state) {
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const sh = getSheet_(), raw = JSON.stringify(state), chunks = [];
    for (let i=0; i<raw.length; i+=GWC_CHUNK_SIZE) chunks.push(raw.slice(i,i+GWC_CHUNK_SIZE));
    sh.clearContents(); sh.getRange(1,1,1,3).setValues([['chunk_index','json_chunk','updated_at']]);
    if (chunks.length) { const now = new Date(); sh.getRange(2,1,chunks.length,3).setValues(chunks.map((c,i)=>[i,c,now])); }
    sh.setFrozenRows(1);
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
  // Public link is not appropriate for private payment slips; restrict access before production use.
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  const id = file.getId();
  return {ok:true,fileId:id,url:'https://drive.google.com/uc?export=view&id='+encodeURIComponent(id),name:file.getName()};
}
function getFolder_() {
  const props = PropertiesService.getScriptProperties(); let id = props.getProperty('GWC_DRIVE_FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  const folder = DriveApp.createFolder(GWC_FOLDER_NAME); props.setProperty('GWC_DRIVE_FOLDER_ID', folder.getId()); return folder;
}
function safeName_(name) { return String(name).replace(/[\\/:*?"<>|#%{}~&]/g,'_').slice(0,120) || 'gwc-file'; }
function json_(value) { return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON); }
