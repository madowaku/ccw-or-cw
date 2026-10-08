import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {extname,resolve,sep} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const port=Number(process.env.PORT)||5173;
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.js':'text/javascript; charset=utf-8'};
createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
 try{const data=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);}
 catch{res.writeHead(404).end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log('↺ OR ↻: http://localhost:'+port));
