/**
 * GWC V17 — Google Apps Script hosted website + guarded cloud storage.
 * Existing state schema, login records, upload actions and fee-cycle logic are retained.
 * No Render/Node hosting is required when the Apps Script Web App serves index.html.
 *
 * Deploy as Web App: Execute as Me; access setting must match the existing public-site model.
 * Script Properties preserved: GWC_SPREADSHEET_ID, GWC_DRIVE_FOLDER_ID.
 */
const GWC_SHEET_NAME = 'GWC_Storage';
const GWC_CHUNK_SIZE = 24000;                 // conservative UTF-16 code-unit limit
const GWC_MAX_PAYLOAD_CHARS = 2000000;        // hard stop; never truncate or reset
const GWC_FOLDER_NAME = 'GWC_Uploads';
const GWC_BACKUP_SHEET_NAME = 'GWC_Storage_Backup';
const GWC_DELETED_FOLDER_NAME = 'GWC_Deleted_Items';
const GWC_RECOVERY_FOLDER_NAME = 'GWC_Recovery_Backups';
const GWC_SCHEMA_VERSION = 17;
const GWC_CODE_VERSION = 'GWC_V17_STABLE_SYNC';
const GWC_STAGE_SHEET = 'GWC_Storage_Stage';

function doGet(e) {
  const action = String((e && e.parameter && e.parameter.action) || '').toLowerCase();
  if (!action) {
    return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Growth World Classes')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');
  }
  if (action === 'health' || action === 'ping') return json_({ok:true,service:'GWC Apps Script V17',time:new Date().toISOString(),codeVersion:GWC_CODE_VERSION});
  if (['load','get','getstate','loadstate','read','loadmeta','meta','metadata','getmeta','loadmetadata'].indexOf(action) >= 0) {
    try { return json_(loadResponse_()); }
    catch (err) { return json_({ok:false,error:String(err && err.message || err)}); }
  }
  if (action === 'diagnose') {
    try {
      const sh=getSheet_(), props=PropertiesService.getScriptProperties();
      return json_({ok:true,primarySheet:sh.getName(),rows:sh.getLastRow(),revision:getRevision_(),
        activeSheet:props.getProperty('GWC_ACTIVE_SHEET')||GWC_SHEET_NAME,
        spreadsheetIdConfigured:!!props.getProperty('GWC_SPREADSHEET_ID'),
        recoveryFolderConfigured:!!props.getProperty('GWC_RECOVERY_FOLDER_ID'),codeVersion:GWC_CODE_VERSION});
    } catch(err) { return json_({ok:false,error:String(err.message||err)}); }
  }
  return json_({ok:false,error:'Unknown GET action: '+action});
}

/* HtmlService bridge: the same API is used whether the page is GAS-hosted or proxied. */
function gwcApiLoad() { return loadResponse_(); }
function gwcApiPost(payload) { return postPayload_(payload); }

function loadResponse_() {
  const state=readState_();
  const raw=readRawFromSheet_(getActiveSheet_());
  return {ok:true,state:state,meta:{service:'GWC Apps Script V17',time:new Date().toISOString(),
    hasState:true,revision:getRevision_(),sha256:sha256_(raw),schemaVersion:GWC_SCHEMA_VERSION,codeVersion:GWC_CODE_VERSION}};
}

function doPost(e) {
  try {
    const raw=e&&e.postData&&e.postData.contents;
    if(!raw) throw new Error('Missing request body');
    return json_(postPayload_(JSON.parse(raw)));
  } catch(err) { return json_({ok:false,error:String(err&&err.message||err)}); }
}

function postPayload_(payload) {
  const action=String(payload.action||payload.type||payload.op||payload.command||'').toLowerCase();
  if(['save','set','savestate','writestate'].indexOf(action)>=0) {
    if((!payload.state||typeof payload.state!=='object'||Array.isArray(payload.state)) &&
       payload.data&&typeof payload.data==='object'&&!Array.isArray(payload.data)) payload.state=payload.data;
    if(!payload.state||typeof payload.state!=='object'||Array.isArray(payload.state)) throw new Error('Invalid state object.');
    const result=writeState_(payload.state,payload.expectedRevision);
    return {ok:true,savedAt:new Date().toISOString(),meta:result};
  }
  if(['upload','uploadfile'].indexOf(action)>=0) return uploadFile_(payload);
  if(['archivefile','deletefile'].indexOf(action)>=0) return archiveDriveFile_(payload);
  if(action==='health'||action==='ping') return {ok:true,service:'GWC Apps Script V17',time:new Date().toISOString()};
  throw new Error('Unknown POST action: '+action);
}

function getSpreadsheet_() {
  const id=PropertiesService.getScriptProperties().getProperty('GWC_SPREADSHEET_ID');
  if(!id) throw new Error('GWC_SPREADSHEET_ID Script Property missing. No blank spreadsheet will be created.');
  return SpreadsheetApp.openById(id);
}
function getSheet_() {
  const ss=getSpreadsheet_();
  const sh=ss.getSheetByName(GWC_SHEET_NAME);
  if(!sh) throw new Error('Existing GWC_Storage sheet not found. No blank storage sheet will be created.');
  return sh;
}
function getActiveSheet_() {
  const ss=getSpreadsheet_(), props=PropertiesService.getScriptProperties();
  const active=props.getProperty('GWC_ACTIVE_SHEET');
  const sh=active?ss.getSheetByName(active):ss.getSheetByName(GWC_SHEET_NAME);
  if(!sh) throw new Error('Active GWC storage sheet missing. Refusing to initialize empty state.');
  return sh;
}
function getRevision_() {
  return Number(PropertiesService.getScriptProperties().getProperty('GWC_REVISION')||'0');
}
function sha256_(s) {
  const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(s),Utilities.Charset.UTF_8);
  return bytes.map(b=>('0'+((b+256)%256).toString(16)).slice(-2)).join('');
}
function splitChunks_(raw) {
  const out=[];
  for(let i=0;i<raw.length;) {
    let end=Math.min(raw.length,i+GWC_CHUNK_SIZE);
    // Do not split a UTF-16 surrogate pair at a chunk boundary.
    if(end<raw.length) {
      const last=raw.charCodeAt(end-1), next=raw.charCodeAt(end);
      if(last>=0xD800&&last<=0xDBFF&&next>=0xDC00&&next<=0xDFFF) end--;
    }
    if(end<=i) throw new Error('Unable to create a safe Unicode chunk boundary.');
    out.push(raw.slice(i,end)); i=end;
  }
  if(!out.length) out.push('{}');
  return out;
}
function rowsFromRaw_(raw, stamp, revision) {
  const chunks=splitChunks_(raw), total=chunks.length, fullHash=sha256_(raw);
  const rows=[['chunk_index','json_chunk','updated_at','chunk_sha256','total_chunks','payload_sha256','revision']];
  chunks.forEach((c,i)=>rows.push([String(i),'GWC_CHUNK_V1:'+c,stamp,sha256_(c),total,fullHash,revision]));
  return {rows:rows,chunks:chunks,hash:fullHash};
}
function readRawFromSheet_(sh) {
  const last=sh.getLastRow();
  if(last<2) return '';
  const width=Math.max(3,Math.min(7,sh.getLastColumn()||3));
  const values=sh.getRange(2,1,last-1,width).getValues()
    .filter(r=>r[1]!==''&&r[1]!==null);
  values.sort((a,b)=>Number(a[0])-Number(b[0]));
  if(!values.length) return '';
  const chunks=[];
  let declaredTotal=null, declaredHash=null;
  values.forEach((r,i)=>{
    const idx=Number(r[0]);
    if(!isFinite(idx)||Math.floor(idx)!==idx||idx!==i) throw new Error('Storage chunk index gap/duplicate at row '+(i+2)+'.');
    let v=String(r[1]==null?'':r[1]);
    if(v.indexOf('GWC_CHUNK_V1:')===0) v=v.slice('GWC_CHUNK_V1:'.length);
    if(r.length>=7&&r[3]) {
      if(sha256_(v)!==String(r[3])) throw new Error('Chunk SHA-256 mismatch at chunk '+idx+'.');
      const t=Number(r[4]);
      if(declaredTotal===null) {declaredTotal=t;declaredHash=String(r[5]||'');}
      if(t!==declaredTotal||String(r[5]||'')!==declaredHash) throw new Error('Chunk manifest mismatch at chunk '+idx+'.');
    }
    chunks.push(v);
  });
  if(declaredTotal!==null&&declaredTotal!==chunks.length) throw new Error('Storage manifest total-chunk mismatch.');
  const raw=chunks.join('');
  if(declaredHash&&sha256_(raw)!==declaredHash) throw new Error('Full payload SHA-256 mismatch.');
  return raw;
}
function parseState_(raw, source) {
  if(!raw) throw new Error(source+' is empty. Refusing to initialize or overwrite data.');
  if(raw.length>GWC_MAX_PAYLOAD_CHARS) throw new Error(source+' exceeds configured payload limit.');
  let state;
  try { state=JSON.parse(raw); } catch(e) { throw new Error(source+' JSON is invalid: '+e.message); }
  if(!state||typeof state!=='object'||Array.isArray(state)) throw new Error(source+' JSON root is not a state object.');
  ['courses','users','students'].forEach(k=>{
    if(state[k]!==undefined&&!Array.isArray(state[k])) throw new Error(source+' has invalid '+k+' collection.');
  });
  const core=['courses','users','students'].reduce((n,k)=>n+(Array.isArray(state[k])?state[k].length:0),0);
  if(core===0) throw new Error(source+' contains an empty default database (0 courses, 0 users, 0 students). Refusing to treat it as valid cloud state.');
  return state;
}
function readState_() {
  const sh=getActiveSheet_(), props=PropertiesService.getScriptProperties();
  const pendingText=props.getProperty('GWC_PENDING_COMMIT');
  let pending=null;
  if(pendingText){try{pending=JSON.parse(pendingText);}catch(e){pending=null;}}
  let primaryRaw='',primaryState=null,primaryError=null;
  try { primaryRaw=readRawFromSheet_(sh); primaryState=parseState_(primaryRaw,sh.getName()); }
  catch(e) { primaryError=e; }
  if(primaryState) {
    if(pending&&pending.status==='COMMITTING'&&pending.hash) {
      const stage=getSpreadsheet_().getSheetByName(GWC_STAGE_SHEET);
      if(stage) {
        let stagedRaw='';
        try { stagedRaw=readRawFromSheet_(stage); } catch(e) { stagedRaw=''; }
        if(stagedRaw&&sha256_(stagedRaw)===pending.hash) {
          if(sha256_(primaryRaw)!==pending.hash) {
            // Crash after intent was recorded but before the primary swap completed:
            // finish the verified transaction from the immutable prepared stage.
            parseState_(stagedRaw,'Verified pending stage');
            writeRawToSheet_(sh,stagedRaw,pending.revision);
            primaryRaw=readRawFromSheet_(sh);
            if(sha256_(primaryRaw)!==pending.hash) throw new Error('Pending commit recovery read-back failed. Previous backup retained.');
            primaryState=parseState_(primaryRaw,'Recovered primary');
          }
          props.setProperty('GWC_REVISION',String(pending.revision));
          props.setProperty('GWC_ACTIVE_SHEET',sh.getName());
          props.deleteProperty('GWC_PENDING_COMMIT');
        }
      }
    }
    return primaryState;
  }
  // Recover only a fully staged payload with an explicit COMMITTING intent.
  if(!pending||pending.status!=='COMMITTING'||!pending.hash) throw primaryError||new Error('Primary state is invalid.');
  const stage=getSpreadsheet_().getSheetByName(GWC_STAGE_SHEET);
  if(!stage) throw primaryError||new Error('Primary invalid and verified stage missing.');
  const stagedRaw=readRawFromSheet_(stage);
  if(sha256_(stagedRaw)!==pending.hash) throw new Error('Primary is invalid and pending stage hash does not match. Existing recovery data preserved.');
  const candidate=parseState_(stagedRaw,'Verified pending stage');
  writeRawToSheet_(sh,stagedRaw,pending.revision);
  if(sha256_(readRawFromSheet_(sh))!==pending.hash) throw new Error('Automatic recovery write did not verify. Existing backup preserved.');
  props.setProperty('GWC_REVISION',String(pending.revision));
  props.setProperty('GWC_ACTIVE_SHEET',sh.getName());
  props.deleteProperty('GWC_PENDING_COMMIT');
  return candidate;
}
function writeRawToSheet_(sh,raw,revision) {
  const pack=rowsFromRaw_(raw,new Date(),revision);
  sh.clearContents();
  sh.getRange(1,1,pack.rows.length,7).setNumberFormat('@');
  sh.getRange(1,1,pack.rows.length,7).setValues(pack.rows);
  sh.setFrozenRows(1);
}
function validateNoMassReset_(oldState,newState) {
  if(!oldState) return;
  const keys=['courses','users','students'];
  const oldCounts=keys.map(k=>(Array.isArray(oldState[k])?oldState[k].length:0));
  const newCounts=keys.map(k=>(Array.isArray(newState[k])?newState[k].length:0));
  if(oldCounts.some((n,i)=>n>0&&newCounts[i]===0)) {
    throw new Error('SAFETY BLOCK: refusing to replace populated data with an empty '+keys.filter((k,i)=>oldCounts[i]>0&&newCounts[i]===0).join('/')+' collection. Reload verified server state before saving.');
  }
  const oldTotal=oldCounts.reduce((a,b)=>a+b,0), newTotal=newCounts.reduce((a,b)=>a+b,0);
  if(oldTotal>=20&&newTotal<Math.floor(oldTotal*0.2)) {
    throw new Error('SAFETY BLOCK: proposed save removes more than 80% of core records. No data was changed.');
  }
}
function getRecoveryFolder_() {
  const props=PropertiesService.getScriptProperties();
  let id=props.getProperty('GWC_RECOVERY_FOLDER_ID');
  if(id) {try{return DriveApp.getFolderById(id);}catch(e){throw new Error('Configured GWC_RECOVERY_FOLDER_ID is inaccessible. Backup failed; primary not changed.');}}
  const folder=DriveApp.createFolder(GWC_RECOVERY_FOLDER_NAME);
  props.setProperty('GWC_RECOVERY_FOLDER_ID',folder.getId());
  return folder;
}
function createRecoverySnapshot_(raw,state,revision,status) {
  const hash=sha256_(raw), folder=getRecoveryFolder_();
  const now=new Date(), stamp=Utilities.formatDate(now,Session.getScriptTimeZone()||'Asia/Kolkata','yyyyMMdd_HHmmss');
  const counts={};
  Object.keys(state).forEach(k=>{if(Array.isArray(state[k]))counts[k]=state[k].length;});
  const snapshot={metadata:{schemaVersion:GWC_SCHEMA_VERSION,codeVersion:GWC_CODE_VERSION,revision:revision,
    timestamp:now.toISOString(),timezone:Session.getScriptTimeZone()||'Asia/Kolkata',
    sha256:hash,characters:raw.length,utf8Bytes:Utilities.newBlob(raw).getBytes().length,
    chunkSize:GWC_CHUNK_SIZE,chunkCount:splitChunks_(raw).length,recordCounts:counts,
    sourceSpreadsheetId:PropertiesService.getScriptProperties().getProperty('GWC_SPREADSHEET_ID'),
    status:status},state:state};
  const file=folder.createFile('GWC_'+status+'_R'+revision+'_'+stamp+'_'+hash.slice(0,12)+'.json',
    JSON.stringify(snapshot),MimeType.PLAIN_TEXT);
  return file;
}
function writeState_(state,expectedRevision) {
  if(!state||typeof state!=='object'||Array.isArray(state)) throw new Error('Refusing invalid state object.');
  const raw=JSON.stringify(state);
  const parsed=parseState_(raw,'Incoming state');
  if(raw.length>GWC_MAX_PAYLOAD_CHARS) throw new Error('Payload exceeds '+GWC_MAX_PAYLOAD_CHARS+' characters. No write performed.');
  const lock=LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const props=PropertiesService.getScriptProperties(), ss=getSpreadsheet_(), sh=getActiveSheet_();
    const currentRevision=getRevision_();
    if(expectedRevision===undefined||expectedRevision===null||expectedRevision==='') {
      if(currentRevision>0) throw new Error('REVISION_REQUIRED: reload the latest cloud state before saving.');
      expectedRevision=0;
    }
    if(Number(expectedRevision)!==currentRevision) throw new Error('STALE_WRITE: expected revision '+expectedRevision+', current server revision '+currentRevision+'. Save rejected; reload latest data before editing again.');
    let oldRaw='',oldState=null;
    try { oldRaw=readRawFromSheet_(sh); if(oldRaw) oldState=parseState_(oldRaw,sh.getName()); }
    catch(e) { throw new Error('PRIMARY_INVALID: existing primary data failed validation. No overwrite allowed. '+e.message); }
    if(!oldRaw) throw new Error('PRIMARY_EMPTY: existing storage is empty. Refusing to initialize from browser defaults.');
    validateNoMassReset_(oldState,parsed);
    // Immutable previous-state recovery point must succeed before any primary mutation.
    createRecoverySnapshot_(oldRaw,oldState,currentRevision,'PRECOMMIT');
    const nextRevision=currentRevision+1, pack=rowsFromRaw_(raw,new Date(),nextRevision);
    if(pack.chunks.some(c=>c.length>GWC_CHUNK_SIZE)) throw new Error('Chunk size validation failed.');
    let stage=ss.getSheetByName(GWC_STAGE_SHEET); if(!stage) stage=ss.insertSheet(GWC_STAGE_SHEET);
    stage.clearContents();
    stage.getRange(1,1,pack.rows.length,7).setNumberFormat('@');
    stage.getRange(1,1,pack.rows.length,7).setValues(pack.rows);
    const stageRaw=readRawFromSheet_(stage);
    if(stageRaw!==raw||sha256_(stageRaw)!==pack.hash) throw new Error('STAGING_HASH_MISMATCH: staged content differs from source. Primary remains unchanged.');
    parseState_(stageRaw,'Staged payload');
    // Prepared snapshot provides an independently recoverable copy of the intended new state.
    const prepared=createRecoverySnapshot_(raw,parsed,nextRevision,'PREPARED');
    props.setProperty('GWC_PENDING_COMMIT',JSON.stringify({status:'COMMITTING',revision:nextRevision,hash:pack.hash,preparedFileId:prepared.getId()}));
    try {
      writeRawToSheet_(sh,raw,nextRevision);
      const finalRaw=readRawFromSheet_(sh);
      if(finalRaw!==raw||sha256_(finalRaw)!==pack.hash) throw new Error('PRIMARY_READBACK_HASH_MISMATCH: primary write not verified.');
      props.setProperty('GWC_REVISION',String(nextRevision));
      props.setProperty('GWC_ACTIVE_SHEET',sh.getName());
      props.deleteProperty('GWC_PENDING_COMMIT');
      try { prepared.setDescription('COMMITTED | revision='+nextRevision+' | sha256='+pack.hash+' | schema='+GWC_SCHEMA_VERSION); } catch(e) {}
      props.setProperty('GWC_LAST_HOURLY_HASH',pack.hash);
      props.setProperty('GWC_LAST_HOURLY_AT',String(Date.now()));
      return {revision:nextRevision,sha256:pack.hash,characters:raw.length,utf8Bytes:Utilities.newBlob(raw).getBytes().length,
        chunks:pack.chunks.length,recordCounts:recordCounts_(parsed),schemaVersion:GWC_SCHEMA_VERSION,codeVersion:GWC_CODE_VERSION};
    } catch(commitErr) {
      // Best-effort rollback to the already snapshotted previous valid state.
      try {
        writeRawToSheet_(sh,oldRaw,currentRevision);
        if(readRawFromSheet_(sh)!==oldRaw) throw new Error('rollback readback mismatch');
        props.deleteProperty('GWC_PENDING_COMMIT');
      } catch(rollbackErr) {
        throw new Error('COMMIT_FAILED_AND_ROLLBACK_NEEDS_RECOVERY: '+commitErr.message+'; '+rollbackErr.message+'. Previous snapshot and verified stage retained.');
      }
      throw commitErr;
    }
  } finally { lock.releaseLock(); }
}
function recordCounts_(state) {
  const out={}; Object.keys(state).forEach(k=>{if(Array.isArray(state[k]))out[k]=state[k].length;}); return out;
}
function createGwcHourlySnapshot() {
  const lock=LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const state=readState_(), raw=readRawFromSheet_(getActiveSheet_()), hash=sha256_(raw);
    const props=PropertiesService.getScriptProperties(), lastHash=props.getProperty('GWC_LAST_HOURLY_HASH')||'';
    const lastAt=Number(props.getProperty('GWC_LAST_HOURLY_AT')||'0');
    if(hash===lastHash&&Date.now()-lastAt<55*60*1000) return 'No new data; hourly snapshot skipped.';
    const file=createRecoverySnapshot_(raw,state,getRevision_(),'HOURLY');
    props.setProperty('GWC_LAST_HOURLY_HASH',hash); props.setProperty('GWC_LAST_HOURLY_AT',String(Date.now()));
    return 'Hourly recovery snapshot created: '+file.getName();
  } finally { lock.releaseLock(); }
}
function installGwcRecoveryTrigger() {
  const triggers=ScriptApp.getProjectTriggers();
  triggers.forEach(t=>{if(t.getHandlerFunction()==='createGwcHourlySnapshot')ScriptApp.deleteTrigger(t);});
  ScriptApp.newTrigger('createGwcHourlySnapshot').timeBased().everyHours(1).create();
  return 'GWC hourly recovery trigger installed.';
}

/* Existing Drive upload/archive functions retained. */
function uploadFile_(p) {
  if(!p.dataUrl||!p.name)throw new Error('Missing file data');
  const match=String(p.dataUrl).match(/^data:([^;,]+);base64,(.+)$/);
  if(!match)throw new Error('Invalid file data');
  const bytes=Utilities.base64Decode(match[2]);
  if(bytes.length>1000000)throw new Error('File must be 1 MB or smaller');
  const mime=String(p.mimeType||match[1]||'application/octet-stream');
  const allowed=['image/jpeg','image/png','image/webp','image/gif','application/pdf'];
  if(allowed.indexOf(mime)===-1)throw new Error('Only JPG, PNG, WEBP, GIF and PDF files are allowed');
  const folder=getFolder_(),blob=Utilities.newBlob(bytes,mime,safeName_(p.name)),file=folder.createFile(blob);
  if(p.privateFile!==true)file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);
  const id=file.getId();
  return {ok:true,fileId:id,url:'https://drive.google.com/uc?export=view&id='+encodeURIComponent(id),name:file.getName(),privateFile:p.privateFile===true};
}
function archiveDriveFile_(p) {
  const id=String(p.fileId||'').trim(); if(!id)throw new Error('Missing Drive fileId');
  const file=DriveApp.getFileById(id); let folder;
  const it=DriveApp.getFoldersByName(GWC_DELETED_FOLDER_NAME); folder=it.hasNext()?it.next():DriveApp.createFolder(GWC_DELETED_FOLDER_NAME);
  folder.addFile(file);
  try{const parents=file.getParents();while(parents.hasNext()){const parent=parents.next();if(parent.getId()!==folder.getId())parent.removeFile(file);}}catch(e){}
  return {ok:true,archived:true,fileId:id,folder:GWC_DELETED_FOLDER_NAME};
}
function getFolder_() {
  const props=PropertiesService.getScriptProperties(); let id=props.getProperty('GWC_DRIVE_FOLDER_ID');
  if(id){try{return DriveApp.getFolderById(id);}catch(e){throw new Error('GWC_DRIVE_FOLDER_ID is configured but inaccessible.');}}
  const folder=DriveApp.createFolder(GWC_FOLDER_NAME);props.setProperty('GWC_DRIVE_FOLDER_ID',folder.getId());return folder;
}
function safeName_(name){return String(name).replace(/[\\/:*?"<>|#%{}~&]/g,'_').slice(0,120)||'gwc-file';}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}

/* Fee-cycle trigger retained; now captures the revision before reading to prevent stale writes. */
function installGwcDailyFeeTrigger() {
  const triggers=ScriptApp.getProjectTriggers();
  triggers.forEach(t=>{if(t.getHandlerFunction()==='processGwcMonthlyFees')ScriptApp.deleteTrigger(t);});
  ScriptApp.newTrigger('processGwcMonthlyFees').timeBased().everyDays(1).atHour(2).create();
  return 'Daily GWC monthly-fee expiry trigger installed.';
}
function installGwcV17Triggers() {
  installGwcDailyFeeTrigger();
  installGwcRecoveryTrigger();
  return 'GWC V17 daily fee and hourly recovery triggers installed.';
}
function processGwcMonthlyFees() {
  const expectedRevision=getRevision_();
  const state=readState_();
  if(!state||!Array.isArray(state.students))return 'No valid student state found; no changes made.';
  const now=new Date(); let changed=false;
  state.students.forEach(st=>{
    if(st&&st.monthlyPaymentDate){
      const day=Math.min(28,Math.max(1,Number(st.monthlyPaymentDate)||5));
      const periodsFixed=Array.isArray(st.feePeriods)?st.feePeriods.filter(p=>p&&!p.reversedAt):[];
      const currentFixed=periodsFixed.filter(p=>p&&p.startAt&&p.endAt&&new Date(p.startAt).getTime()<=now.getTime()&&new Date(p.endAt).getTime()>now.getTime())
        .sort((a,b)=>new Date(b.endAt).getTime()-new Date(a.endAt).getTime())[0]||null;
      const limit=Math.max(1,Number(st.totalCycles)||1200),cyclesDone=Math.max(0,Number(st.approvedCycles)||0);
      const hasPendingFee=Array.isArray(state.feeRequests)&&state.feeRequests.some(q=>q&&q.studentId===st.id&&q.status==='pending');
      const forceStart=st.forceActiveStart?new Date(String(st.forceActiveStart).slice(0,10)+'T00:00:00'):null;
      const forceEnd=st.forceActiveEnd?new Date(String(st.forceActiveEnd).slice(0,10)+'T23:59:59.999'):null;
      const forceNow=st.forceActive===true&&st.adminPaused!==true&&forceStart&&forceEnd&&now>=forceStart&&now<=forceEnd;
      const activeFixed=st.adminPaused!==true&&(forceNow||(cyclesDone<limit&&!!currentFixed&&!hasPendingFee));
      if(st.courseAccessActive!==activeFixed){st.courseAccessActive=activeFixed;changed=true;}
      if(currentFixed&&st.activeUntil!==currentFixed.endAt){st.activeUntil=currentFixed.endAt;changed=true;}
      const localNow=new Date(Utilities.formatDate(now,Session.getScriptTimeZone()||'Asia/Kolkata','yyyy/MM/dd HH:mm:ss'));
      let due=st.nextPaymentDate?new Date(String(st.nextPaymentDate).slice(0,10)+'T00:00:00'):new Date(localNow.getFullYear(),localNow.getMonth(),day,0,0,0,0);
      if(isNaN(due.getTime()))due=new Date(localNow.getFullYear(),localNow.getMonth(),day,0,0,0,0);
      const daysLeft=Math.ceil((due.getTime()-localNow.getTime())/86400000);
      const reminder=daysLeft===3&&cyclesDone<limit&&!hasPendingFee;
      if(st.monthlyReminderDue!==reminder){st.monthlyReminderDue=reminder;changed=true;}
      if(cyclesDone>=limit&&st.status!=='cycle_limit_completed'){st.status='cycle_limit_completed';changed=true;}
      return;
    }
    const periods=Array.isArray(st.feePeriods)?st.feePeriods:[];
    if(!periods.length)return;
    const valid=periods.filter(p=>p&&!p.reversedAt&&p.startAt&&p.endAt).sort((a,b)=>new Date(a.endAt).getTime()-new Date(b.endAt).getTime());
    if(!valid.length)return;
    const current=valid.find(p=>new Date(p.startAt).getTime()<=now.getTime()&&new Date(p.endAt).getTime()>now.getTime());
    const latest=valid[valid.length-1];
    const hasPendingFee=Array.isArray(state.feeRequests)&&state.feeRequests.some(q=>q&&q.studentId===st.id&&q.status==='pending');
    const forceStart=st.forceActiveStart?new Date(String(st.forceActiveStart).slice(0,10)+'T00:00:00'):null;
    const forceEnd=st.forceActiveEnd?new Date(String(st.forceActiveEnd).slice(0,10)+'T23:59:59.999'):null;
    const forceNow=st.forceActive===true&&st.adminPaused!==true&&forceStart&&forceEnd&&now>=forceStart&&now<=forceEnd;
    const newActive=st.adminPaused===true?false:(forceNow||(!hasPendingFee&&!!current));
    if(st.courseAccessActive!==newActive){st.courseAccessActive=newActive;changed=true;}
    if(st.activeUntil!==latest.endAt){st.activeUntil=latest.endAt;changed=true;}
    if(current&&st.adminPaused!==true){
      const elapsed=Math.floor((now.getTime()-new Date(current.startAt).getTime())/86400000);
      const due=elapsed===27&&now.getTime()<new Date(current.endAt).getTime()&&!hasPendingFee;
      if(st.monthlyReminderDue!==due){st.monthlyReminderDue=due;changed=true;}
      if(due&&st.monthlyReminderFor!==current.requestId){st.monthlyReminderFor=current.requestId||current.startAt;changed=true;}
    }else if(st.monthlyReminderDue){st.monthlyReminderDue=false;changed=true;}
  });
  if(changed)writeState_(state,expectedRevision);
  return changed?'GWC fee expiry/reminder flags updated.':'No fee status changes required.';
}
