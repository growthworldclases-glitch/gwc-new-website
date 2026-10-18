/** GWC Google Sheets + Google Drive backend. Deploy as Web App. */
const GWC_STATE_FILENAME = 'GWC_Website_State.json';
const GWC_UPLOAD_FOLDER = 'GWC_Website_Uploads';
const GWC_SHEET_NAME = 'GWC Website Data';
function doGet(e) {
  return output_({ok:true, service:'GWC Google Sheets + Drive API', message:'Backend deployed. Use website to connect.'});
}
function doPost(e) {
  try {
    const p = e && e.parameter ? e.parameter : {};
    const action = String(p.action || '');
    const payload = p.payload ? JSON.parse(p.payload) : {};
    if (action === 'load') return output_({ok:true, data:loadState_()});
    if (action === 'save') { saveState_(payload); return output_({ok:true, data:{saved:true}}); }
    if (action === 'upload') return output_({ok:true, data:uploadFile_(payload)});
    return output_({ok:false,error:'Unknown action'});
  } catch(err) { return output_({ok:false,error:String(err && err.message || err)}); }
}
function output_(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
function getOrCreateFolder_() {
  const props=PropertiesService.getScriptProperties(); let id=props.getProperty('GWC_UPLOAD_FOLDER_ID');
  if(id) { try{return DriveApp.getFolderById(id);}catch(e){} }
  const it=DriveApp.getFoldersByName(GWC_UPLOAD_FOLDER); const folder=it.hasNext()?it.next():DriveApp.createFolder(GWC_UPLOAD_FOLDER);
  props.setProperty('GWC_UPLOAD_FOLDER_ID',folder.getId()); return folder;
}
function getOrCreateSheet_() {
  const props=PropertiesService.getScriptProperties(); let id=props.getProperty('GWC_SPREADSHEET_ID');
  if(id) { try{return SpreadsheetApp.openById(id);}catch(e){} }
  const ss=SpreadsheetApp.create(GWC_SHEET_NAME); const sh=ss.getSheets()[0]; sh.setName('Sync Log'); sh.appendRow(['Timestamp','Action','Drive File ID','Note']);
  props.setProperty('GWC_SPREADSHEET_ID',ss.getId()); return ss;
}
function loadState_() {
  const id=PropertiesService.getScriptProperties().getProperty('GWC_STATE_FILE_ID');
  if(!id) return {};
  try { return JSON.parse(DriveApp.getFileById(id).getBlob().getDataAsString('UTF-8')); } catch(e) { return {}; }
}
function saveState_(state) {
  const json=JSON.stringify(state); if(json.length>4500000) throw new Error('Website state is too large for safe single-file sync.');
  const props=PropertiesService.getScriptProperties(); let id=props.getProperty('GWC_STATE_FILE_ID'); let file;
  if(id) { try { file=DriveApp.getFileById(id); file.setContent(json); } catch(e) { file=null; } }
  if(!file) { file=getOrCreateFolder_().createFile(GWC_STATE_FILENAME,json,MimeType.PLAIN_TEXT); props.setProperty('GWC_STATE_FILE_ID',file.getId()); }
  getOrCreateSheet_().getSheetByName('Sync Log').appendRow([new Date(),'SAVE',file.getId(),'Website state saved']);
}
function uploadFile_(payload) {
  if(!payload || !payload.data || !payload.name) throw new Error('File data/name missing');
  const match=String(payload.data).match(/^data:([^;]+);base64,(.+)$/); if(!match) throw new Error('Invalid base64 data');
  const bytes=Utilities.base64Decode(match[2]); if(bytes.length>1000000) throw new Error('Maximum upload size is 1MB');
  const blob=Utilities.newBlob(bytes, payload.mimeType || match[1], String(payload.name).replace(/[\\/]/g,'_'));
  const file=getOrCreateFolder_().createFile(blob);
  // Anyone-with-link is required for public posters/slips to render in the static site.
  // Restrict the Drive folder and do not upload sensitive identity documents unless intended.
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  getOrCreateSheet_().getSheetByName('Sync Log').appendRow([new Date(),'UPLOAD',file.getId(),file.getName()]);
  return {id:file.getId(),url:'https://drive.google.com/uc?export=view&id='+file.getId(),name:file.getName()};
}
