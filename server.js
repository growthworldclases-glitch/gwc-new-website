const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const app = express();
const PORT = process.env.PORT || 10000;
const DATA_DIR = process.env.DATA_DIR || '/var/data';
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const STATE_FILE = path.join(DATA_DIR, 'gwc-state.json');
fs.mkdirSync(UPLOAD_DIR, {recursive:true});
app.use(express.json({limit:'15mb'}));
const upload = multer({storage:multer.diskStorage({
  destination: (_req,_file,cb)=>cb(null,UPLOAD_DIR),
  filename: (_req,file,cb)=>cb(null,crypto.randomBytes(16).toString('hex')+path.extname(file.originalname).toLowerCase().slice(0,10))
}), limits:{fileSize:1000000}, fileFilter:(_req,file,cb)=>{
  const ok=/^(image\/(jpeg|png|webp|gif)|application\/pdf)$/.test(file.mimetype);
  cb(ok?null:new Error('Sirf JPG, PNG, WEBP, GIF ya PDF file allowed hai.'),ok);
}});
const defaults={admin:{username:'9140078222',password:'1235'},settings:{logo:'',hero:'',posters:[]},courses:[],users:[],students:[],attendance:[],homework:[],tests:[],audit:[],lastIds:{student:0,teacher:0,subadmin:0}};
function readState(){try{return JSON.parse(fs.readFileSync(STATE_FILE,'utf8'))}catch{return defaults}}
function writeState(value){const tmp=STATE_FILE+'.tmp';fs.writeFileSync(tmp,JSON.stringify(value));fs.renameSync(tmp,STATE_FILE)}
app.get('/api/health',(_req,res)=>res.json({ok:true,storage:DATA_DIR===' /var/data'?'disk':'configured'}));
app.get('/api/state',(_req,res)=>res.set('Cache-Control','no-store').json(readState()));
app.put('/api/state',(req,res)=>{try{if(!req.body||typeof req.body!=='object'||Array.isArray(req.body))return res.status(400).json({error:'Invalid state'});writeState(req.body);res.json({ok:true})}catch(e){console.error(e);res.status(500).json({error:'State could not be saved'})}});
app.post('/api/upload',upload.single('file'),(req,res)=>{if(!req.file)return res.status(400).json({error:'File missing'});res.json({ok:true,url:'/uploads/'+req.file.filename,filename:req.file.filename})});
app.use('/uploads',express.static(UPLOAD_DIR,{maxAge:'1d',immutable:true}));
app.use(express.static(path.join(__dirname)));
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'index.html')));
app.use((err,_req,res,_next)=>{console.error(err.message);res.status(err.code==='LIMIT_FILE_SIZE'?413:400).json({error:err.code==='LIMIT_FILE_SIZE'?'File 1MB se bada hai.':err.message||'Request failed'})});
app.listen(PORT,()=>console.log(`GWC Render server listening on ${PORT}; persistent data path: ${DATA_DIR}`));
