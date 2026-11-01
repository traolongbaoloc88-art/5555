import http from 'node:http';
import {readFile} from 'node:fs/promises';
const allowed = new Set(['index.html','config.js','profit.js','app.js','style.css']);
const mime={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',css:'text/css; charset=utf-8'};
const port=Number(process.env.PORT || 3000);
http.createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 const file=path==='/'?'index.html':path.slice(1);
 if(!allowed.has(file)){res.writeHead(404);res.end('Not found');return;}
 try{const data=await readFile(new URL(file,import.meta.url));res.writeHead(200,{'Content-Type':mime[file.split('.').pop()]});res.end(data);}
 catch{res.writeHead(500);res.end('Cannot read file');}
}).listen(port,'127.0.0.1',()=>console.log('GUGEE: http://localhost:'+port));
