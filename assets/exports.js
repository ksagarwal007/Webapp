/* Shared export helpers: PDF, Excel (.xlsx), PNG and sharing. No libraries. Loaded on demand by window.lazy(). */
(function(){
const HW=[278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
const HB=[278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,556,556,778,556,556,500,389,280,389,584];
const tw=(s,z,b)=>{let w=0;for(const ch of String(s)){const c=ch.charCodeAt(0);w+=c>=32&&c<=126?(b?HB:HW)[c-32]:556}return w*z/1000};
const wa=s=>String(s).replace(/[\u2018\u2019]/g,"'").replace(/[\u201C\u201D]/g,'"').replace(/\u2026/g,'...').replace(/[\u2013\u2014]/g,'-').replace(/\u2192/g,'->').replace(/\u00D7/g,'x').replace(/[^\x20-\x7E\u00A0-\u00FF]/g,'?');
const pe=s=>wa(s).replace(/[\\()]/g,'\\$&').replace(/[\u0080-\u00FF]/g,c=>'\\'+c.charCodeAt(0).toString(8).padStart(3,'0'));
const saveBlob=(b,n)=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=n;document.body.appendChild(a);a.click();setTimeout(()=>{a.remove();URL.revokeObjectURL(a.href)},4000)};
async function rast(svg,w,h,type,bg){const u=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),im=new Image();await new Promise((ok,no)=>{im.onload=ok;im.onerror=()=>no(Error('image render failed'));im.src=u});const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(bg){x.fillStyle=bg;x.fillRect(0,0,w,h)}x.drawImage(im,0,0,w,h);URL.revokeObjectURL(u);const bl=await new Promise(r=>c.toBlob(r,type,.92));return new Uint8Array(await bl.arrayBuffer())}
const logoSvg=(inner,sz)=>`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64' width='${sz}' height='${sz}'>${inner}</svg>`;
async function share(blob,name,title){try{const f=new File([blob],name,{type:blob.type});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title});return 'shared'}}catch(e){if(e&&e.name=='AbortError')return 'cancelled'}saveBlob(blob,name);return 'saved'}

/* ---------- PDF ---------- */
/* d: {site,url,logo,label,date,title,sub,items:[{t:'h'|'big'|'p'|'note'|'gap'|'table'|'img'}]} */
async function pdf(d){
const PW=595,PH=842,MX=48,TOP=66,BOT=776,CW=PW-2*MX,pages=[];let cur,y;
const col=h=>{const n=parseInt(h.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255].map(v=>v.toFixed(3)).join(' ')};
const np=()=>{cur={ops:[],im:[]};pages.push(cur);y=TOP};
const T=(s,x,yy,z,b,c,al)=>{s=String(s);let xx=x;if(al=='r')xx-=tw(s,z,b);else if(al=='c')xx-=tw(s,z,b)/2;cur.ops.push(`BT /${b?'F2':'F1'} ${z} Tf ${col(c||'#0f172a')} rg ${xx.toFixed(2)} ${(PH-yy).toFixed(2)} Td (${pe(s)}) Tj ET`)};
const Ln=(x1,y1,x2,y2,c,w)=>cur.ops.push(`${col(c)} RG ${w||.6} w ${x1} ${PH-y1} m ${x2} ${PH-y2} l S`);
const Rf=(x,yy,w,h,c)=>cur.ops.push(`${col(c)} rg ${x.toFixed(2)} ${(PH-yy-h).toFixed(2)} ${w.toFixed(2)} ${h} re f`);
const need=h=>{if(y+h>BOT)np()};
const wrap=(s,z,w,b)=>{const o=[];let c='';for(const wd of String(s).split(/\s+/)){const t=c?c+' '+wd:wd;if(tw(t,z,b)>w&&c){o.push(c);c=wd}else c=t}if(c)o.push(c);return o.length?o:['']};
np();
const imgs=[{u:await rast(logoSvg(d.logo,256),256,256,'image/jpeg','#ffffff'),w:256,h:256}];
T(d.title,MX,y+18,22,1,'#0f172a');y+=26;if(d.sub){for(const l of wrap(d.sub,10,CW)){T(l,MX,y+10,10,0,'#64748b');y+=14}}y+=8;
for(const it of d.items){
 if(it.t=='gap')y+=it.n||8;
 else if(it.t=='h'){need(34);T(it.text,MX,y+14,13,1,'#1d4ed8');Ln(MX,y+21,MX+CW,y+21,'#cbd5e1');y+=32}
 else if(it.t=='big'){need(60);T(it.text,MX,y+30,30,1,'#2563eb');if(it.sub)T(it.sub,MX+tw(it.text,30,1)+8,y+30,12,0,'#64748b');y+=44}
 else if(it.t=='p'||it.t=='note'){const z=it.t=='note'?8.5:10,c=it.t=='note'?'#64748b':'#334155';for(const l of wrap(it.text,z,CW)){need(z+6);T(l,MX,y+z,z,0,c);y+=z+4}y+=4}
 else if(it.t=='img'){const w=Math.min(CW,it.w),h=it.h*w/it.w;need(h+8);imgs.push({u:it.u8,w:it.pw,h:it.ph});cur.im.push({n:imgs.length,x:MX,y:y,w,h});y+=h+10}
 else if(it.t=='table'){
  const z=9.5,pad=5,cw=it.cols.map(f=>f*CW);
  const draw=(cells,head)=>{const ls=cells.map((c,i)=>wrap(c,z,cw[i]-2*pad,head||(it.boldFirst&&i==0)));const rh=Math.max(...ls.map(l=>l.length))*(z+3)+8;need(rh);
   if(head)Rf(MX,y,CW,rh,'#dbeafe');let x=MX;ls.forEach((l,i)=>{const al=i==0?'l':'r';l.forEach((s,k)=>T(s,al=='r'?x+cw[i]-pad:x+pad,y+z+4+k*(z+3),z,head||(it.boldFirst&&i==0)?1:0,head?'#0f172a':'#1e293b',al));x+=cw[i]});Ln(MX,y+rh,MX+CW,y+rh,'#cbd5e1',.5);y+=rh};
  draw(it.head,1);for(const r of it.rows)draw(r,0);y+=8}
}
const n=pages.length;
pages.forEach((pg,i)=>{cur=pg;pg.im.push({n:1,x:MX,y:21,w:22,h:22});const nm=d.site.split(' '),fw=nm.shift();T(fw,MX+30,38,13,1,'#2563eb');T(' '+nm.join(' '),MX+30+tw(fw,13,1),38,13,1,'#0f172a');T(d.url||'',MX+CW,38,9,0,'#64748b','r');Ln(MX,48,MX+CW,48,'#cbd5e1',.8);Ln(MX,792,MX+CW,792,'#cbd5e1',.8);T(d.site+(d.url?' \u00B7 '+d.url:''),MX,810,8.5,0,'#64748b');T(d.label+' \u00B7 '+d.date,PW/2,810,8.5,0,'#64748b','c');T('Page '+(i+1)+' of '+n,MX+CW,810,8.5,0,'#64748b','r')});
const enc=new TextEncoder(),parts=[],offs=[];let pos=0;const w=u=>{const b=typeof u=='string'?enc.encode(u):u;parts.push(b);pos+=b.length};const ob=(id,fn)=>{offs[id]=pos;w(id+' 0 obj\n');fn();w('\nendobj\n')};
const first=5+imgs.length-1+1,pid=i=>first+3*i,info=first+3*n,N=info+1;
w('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
ob(1,()=>w('<< /Type /Catalog /Pages 2 0 R >>'));ob(2,()=>w('<< /Type /Pages /Count '+n+' /Kids ['+pages.map((_,i)=>pid(i)+' 0 R').join(' ')+'] >>'));
ob(3,()=>w('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'));ob(4,()=>w('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'));
imgs.forEach((m,i)=>ob(5+i,()=>{w('<< /Type /XObject /Subtype /Image /Width '+m.w+' /Height '+m.h+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+m.u.length+' >>\nstream\n');w(m.u);w('\nendstream')}));
pages.forEach((pg,i)=>{const lk=pid(i)+2,ims=pg.im.map(m=>'/Im'+m.n+' '+(4+m.n)+' 0 R').join(' '),ops=pg.ops.concat(pg.im.map(m=>`q ${m.w.toFixed(2)} 0 0 ${m.h.toFixed(2)} ${m.x} ${(PH-m.y-m.h).toFixed(2)} cm /Im${m.n} Do Q`)).join('\n');
 ob(pid(i),()=>w(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PW} ${PH}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << ${ims} >> >> /Contents ${pid(i)+1} 0 R /Annots [${lk} 0 R] >>`));
 ob(pid(i)+1,()=>{const b=enc.encode(ops);w('<< /Length '+b.length+' >>\nstream\n');w(b);w('\nendstream')});
 const ux=MX+CW-tw(d.url||'',9,0);ob(lk,()=>w(d.url?`<< /Type /Annot /Subtype /Link /Rect [${ux.toFixed(1)} ${PH-44} ${MX+CW} ${PH-30}] /Border [0 0 0] /A << /S /URI /URI (${pe('https://'+d.url)}) >> >>`:'<< /Type /Annot /Subtype /Link /Rect [0 0 0 0] /Border [0 0 0] >>'))});
ob(info,()=>w(`<< /Title (${pe(d.title+' - '+d.site)}) /Creator (${pe(d.site)}) /Producer (${pe(d.site)}) >>`));
const xo=pos;w('xref\n0 '+N+'\n0000000000 65535 f \n');for(let i=1;i<N;i++)w(String(offs[i]).padStart(10,'0')+' 00000 n \n');w('trailer\n<< /Size '+N+' /Root 1 0 R /Info '+info+' 0 R >>\nstartxref\n'+xo+'\n%%EOF');
return new Blob(parts,{type:'application/pdf'})}

/* ---------- Excel ---------- */
const CRCT=(()=>{const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
const crc32=u=>{let c=0xFFFFFFFF;for(let i=0;i<u.length;i++)c=CRCT[(c^u[i])&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0};
function zipBlob(files){const en=new TextEncoder(),parts=[],cd=[];let off=0;for(const f of files){const nm=en.encode(f.name),d=f.data,crc=crc32(d),h=new DataView(new ArrayBuffer(30));h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x0800,true);h.setUint16(12,0x21,true);h.setUint32(14,crc,true);h.setUint32(18,d.length,true);h.setUint32(22,d.length,true);h.setUint16(26,nm.length,true);parts.push(new Uint8Array(h.buffer),nm,d);
const c=new DataView(new ArrayBuffer(46));c.setUint32(0,0x02014b50,true);c.setUint16(4,20,true);c.setUint16(6,20,true);c.setUint16(8,0x0800,true);c.setUint16(14,0x21,true);c.setUint32(16,crc,true);c.setUint32(20,d.length,true);c.setUint32(24,d.length,true);c.setUint16(28,nm.length,true);c.setUint32(42,off,true);cd.push(new Uint8Array(c.buffer),nm);off+=30+nm.length+d.length}
const cl=cd.reduce((a,b)=>a+b.length,0),e=new DataView(new ArrayBuffer(22));e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,cl,true);e.setUint32(16,off,true);return new Blob([...parts,...cd,new Uint8Array(e.buffer)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
const XS=s=>String(s).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const XH='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',NS='xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"';
function sheetXml(rows,o){let x=XH+'<worksheet '+NS+'><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><sheetViews><sheetView showGridLines="0" workbookViewId="0"/></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>'+o.cols.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${w}" customWidth="1"/>`).join('')+'</cols><sheetData>';
rows.forEach((cells,ri)=>{if(!cells||!cells.length)return;x+=`<row r="${ri+1}"${o.ht&&o.ht[ri]?` ht="${o.ht[ri]}" customHeight="1"`:''}>`+cells.map(([c,v,s,k])=>{const ref=String.fromCharCode(65+c)+(ri+1);if(k=='n')return`<c r="${ref}" s="${s}"><v>${Number.isFinite(v)?v:0}</v></c>`;if(k=='f')return`<c r="${ref}" s="${s}" t="str"><f>${XS(v[0])}</f><v>${XS(v[1])}</v></c>`;return`<c r="${ref}" s="${s}" t="inlineStr"><is><t>${XS(v)}</t></is></c>`}).join('')+'</row>'});
return x+'</sheetData><pageMargins left="0.5" right="0.5" top="0.8" bottom="0.8" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="landscape" fitToWidth="1" fitToHeight="0"/><headerFooter><oddHeader>'+XS(o.hdr)+'</oddHeader><oddFooter>'+XS(o.ftr)+'</oddFooter></headerFooter><drawing r:id="rId1"/></worksheet>'}
const STY=XH+'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><numFmts count="2"><numFmt numFmtId="164" formatCode="&quot;$&quot;#,##0.00"/><numFmt numFmtId="165" formatCode="&quot;$&quot;#,##0.00####"/></numFmts><fonts count="6"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="20"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font><font><b/><sz val="14"/><name val="Calibri"/></font><font><u/><sz val="11"/><color rgb="FF2563EB"/><name val="Calibri"/></font><font><i/><sz val="10"/><color rgb="FF64748B"/><name val="Calibri"/></font></fonts><fills count="5"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF2563EB"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFDBEAFE"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left/><right/><top/><bottom style="thin"><color rgb="FFCBD5E1"/></bottom><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="12"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="2" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1" applyAlignment="1"><alignment horizontal="left" vertical="center" indent="4"/></xf><xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="4" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="0" fontId="1" fillId="3" borderId="0" xfId="0" applyFont="1" applyFill="1"/><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"/><xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyBorder="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1"><alignment horizontal="right" wrapText="1"/></xf><xf numFmtId="0" fontId="5" fillId="0" borderId="0" xfId="0" applyFont="1"/><xf numFmtId="164" fontId="1" fillId="0" borderId="1" xfId="0" applyNumberFormat="1" applyFont="1" applyBorder="1"><alignment horizontal="right"/></xf><xf numFmtId="0" fontId="1" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1"><alignment horizontal="right"/></xf></cellXfs></styleSheet>';
const XD='http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing',XA='http://schemas.openxmlformats.org/drawingml/2006/main',XR='http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const xpic=(id,rid,row,cx,cy,nm,co,ro)=>`<xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>${co}</xdr:colOff><xdr:row>${row}</xdr:row><xdr:rowOff>${ro}</xdr:rowOff></xdr:from><xdr:ext cx="${cx}" cy="${cy}"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="${id}" name="${nm}" descr="${nm}"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="${XR}" r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor>`;
const xrels=i=>XH+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'+i.map(([id,ty,tg])=>`<Relationship Id="${id}" Type="${XR}/${ty}" Target="${tg}"/>`).join('')+'</Relationships>';
/* d: {site,url,logo,label,date,title,sub,widths:[..],head:[..],rows:[[label,{n,f:'usd'|'int'}|string...]],bold:[rowIndexes],notes:[..],image:{u8,cx,cy,name}} */
async function xlsx(d){
const en=new TextEncoder(),S=[],put=c=>S.push(c),nc=d.widths.length;
const banner=(t,s)=>put(Array.from({length:nc},(_,i)=>[i,i?'':t,s,'t']));
banner(d.site,1);put([[0,d.title,2,'t']]);if(d.sub)put([[0,d.sub,0,'t']]);if(d.url)put([[0,['HYPERLINK("https://'+d.url+'","'+d.url+'")',d.url],3,'f']]);
S.push([]);put(d.head.map((h,i)=>[i,h,i?11:4,'t']));
d.rows.forEach((r,ri)=>{put(r.map((v,i)=>{if(v&&typeof v=='object'){return[i,v.n,v.f=='usd'?(d.bold&&d.bold.includes(ri)?10:6):7,'n']}return[i,v,i?8:5,'t']}))});
S.push([]);let imgRow=-1;
if(d.image){imgRow=S.length;const h=Math.ceil(d.image.cy/9525/20)+1;for(let i=0;i<h;i++)S.push([]);}
(d.notes||[]).forEach(t=>put([[0,t,9,'t']]));put([[0,'Generated by '+d.site+(d.url?' ('+d.url+')':'')+' on '+d.date,9,'t']]);
const hdr='&L'+d.site+'&R'+(d.url||''),ftr='&L'+d.label+' \u00B7 '+d.date+'&RPage &P of &N';
const files=[];files.push({name:'xl/media/image1.png',data:await rast(logoSvg(d.logo,128),128,128,'image/png')});
const pics=[xpic(2,'rId1',0,266700,266700,'Logo',95250,57150)],rels=[['rId1','image','../media/image1.png']];
if(d.image){files.push({name:'xl/media/image2.png',data:d.image.u8});pics.push(xpic(3,'rId2',imgRow,d.image.cx,d.image.cy,d.image.name||'Image',0,0));rels.push(['rId2','image','../media/image2.png'])}
const ct=XH+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="png" ContentType="image/png"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>';
files.unshift({name:'[Content_Types].xml',data:en.encode(ct)},{name:'_rels/.rels',data:en.encode(xrels([['rId1','officeDocument','xl/workbook.xml']]))},
{name:'xl/workbook.xml',data:en.encode(XH+`<workbook ${NS}><sheets><sheet name="${XS(d.sheet||'Sheet1')}" sheetId="1" r:id="rId1"/></sheets></workbook>`)},
{name:'xl/_rels/workbook.xml.rels',data:en.encode(xrels([['rId1','worksheet','worksheets/sheet1.xml'],['rId2','styles','styles.xml']]))},
{name:'xl/styles.xml',data:en.encode(STY)},
{name:'xl/worksheets/sheet1.xml',data:en.encode(sheetXml(S,{cols:d.widths,hdr,ftr,ht:{0:34}}))},
{name:'xl/worksheets/_rels/sheet1.xml.rels',data:en.encode(xrels([['rId1','drawing','../drawings/drawing1.xml']]))},
{name:'xl/drawings/drawing1.xml',data:en.encode(XH+`<xdr:wsDr xmlns:xdr="${XD}" xmlns:a="${XA}">`+pics.join('')+'</xdr:wsDr>')},
{name:'xl/drawings/_rels/drawing1.xml.rels',data:en.encode(xrels(rels))});
return zipBlob(files)}

window.UB={tw,wa,pe,rast,logoSvg,saveBlob,share,pdf,xlsx,crc32,zipBlob};
})();
