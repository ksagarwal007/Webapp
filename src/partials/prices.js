const SAMPLE=[['Anthropic','Large (sample)',5,25,1000],['Anthropic','Mid (sample)',3,15,1000],['Anthropic','Small (sample)',1,5,200],['Google','Flash (sample)',0.3,2.5,1000],['Google','Pro (sample)',1.25,10,1000],['OpenAI','Large (sample)',2.5,10,128],['OpenAI','Mini (sample)',0.15,0.6,128]];
let M=SAMPLE,VF='';
const E=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const money=x=>'$'+(x>0&&x<0.01?x.toFixed(5):x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}));
function loadPrices(cb){cb();fetch('prices.json').then(r=>r.json()).then(j=>{M=j.models.map(m=>[m.provider||'Other',m.name,m.in,m.out,m.ctx||128]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:a[1]<b[1]?-1:1);VF=j.updated;cb()}).catch(()=>{})}
function verified(id){const el=document.getElementById(id),d=VF?(Date.now()-new Date(VF))/864e5:null;el.style.color=(d==null||d>7)?'#f87171':'#4ade80';el.textContent=d==null?'Sample prices, not verified. Real prices load once the daily price job is connected.':'Prices last verified '+VF+(d>7?' (over a week old, treat with caution)':'')+' · '+M.length+' models'}
