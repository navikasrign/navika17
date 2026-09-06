const schemes=[
 {name:'PMEGP',match:94,why:['New business supported','Funding need within demo range','Profile fits entrepreneurship support'],docs:['Aadhaar','PAN','Community Certificate','Income Certificate','Bank Statement','DPR'],compatible:['Training support','Eligible credit-linked assistance']},
 {name:'Stand-Up India',match:88,why:['Women entrepreneur profile','Greenfield enterprise intent','Funding requirement can be evaluated'],docs:['Aadhaar','PAN','Community Certificate','Bank Statement','Business Plan'],compatible:['Handholding support','Bank-linked assistance']},
 {name:'NSFDC Entrepreneurship Support',match:83,why:['SC category selected','Entrepreneurship objective matches','Income rule requires official validation'],docs:['Aadhaar','PAN','Community Certificate','Income Certificate','Bank Statement','Project Report'],compatible:['Skill/training support','Eligible finance support']}
];

const state={selected:null,docs:{},files:{},nameVerified:false};
const steps=[...document.querySelectorAll('.step')];
const panels=[...document.querySelectorAll('.panel')];

function show(id){
 panels.forEach(p=>p.classList.toggle('active-panel',p.id===id));
 steps.forEach(s=>s.classList.toggle('active',s.dataset.target===id));
 document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
}
steps.forEach(s=>s.addEventListener('click',()=>show(s.dataset.target)));

// ---------------- VOICE-ASSISTED PROFILE CREATION ----------------
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
let recognition=null;
const voiceStatus=document.getElementById('voiceStatus');
const voiceTranscript=document.getElementById('voiceTranscript');

function setSelectValue(id,value){
 const el=document.getElementById(id);
 if(!el)return;
 const option=[...el.options].find(o=>o.value.toLowerCase()===value.toLowerCase()||o.text.toLowerCase()===value.toLowerCase());
 if(option)el.value=option.value;
}

function wordsToNumber(text){
 const t=text.toLowerCase().replace(/,/g,' ');
 const digit=t.match(/\b\d+(?:\.\d+)?\b/);
 if(digit)return Number(digit[0]);
 const map={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10};
 let base=0;
 for(const [w,n] of Object.entries(map))if(new RegExp('\\b'+w+'\\b').test(t))base=n;
 if(/lakh|lac/.test(t))return (base||1)*100000;
 if(/thousand/.test(t))return (base||1)*1000;
 return 0;
}

function fillProfileFromSpeech(text){
 const lower=text.toLowerCase();

 const nameMatch=text.match(/(?:my name is|i am called|name is)\s+([a-zA-Z ]+?)(?=,|\.|\bi am\b|\bcategory\b|\bfrom\b|\bbusiness\b|$)/i);
 if(nameMatch)document.getElementById('name').value=nameMatch[1].trim();

 if(/\bfemale\b|\bwoman\b|\bwomen\b/.test(lower))setSelectValue('gender','Female');
 else if(/\bmale\b|\bman\b/.test(lower))setSelectValue('gender','Male');

 if(/\bsc\b|scheduled caste/.test(lower))setSelectValue('category','SC');
 else if(/\bst\b|scheduled tribe/.test(lower))setSelectValue('category','ST');
 else if(/\bobc\b|other backward/.test(lower))setSelectValue('category','OBC');
 else if(/\bgeneral\b/.test(lower))setSelectValue('category','General');

 if(/tamil nadu/.test(lower))setSelectValue('state','Tamil Nadu');
 else if(/karnataka/.test(lower))setSelectValue('state','Karnataka');
 else if(/kerala/.test(lower))setSelectValue('state','Kerala');

 if(/tailor|tailoring|sewing/.test(lower))setSelectValue('business','Tailoring');
 else if(/food processing|food business/.test(lower))setSelectValue('business','Food Processing');
 else if(/retail|shop/.test(lower))setSelectValue('business','Retail');
 else if(/service/.test(lower))setSelectValue('business','Services');

 if(/existing business|already running|existing/.test(lower))setSelectValue('stage','Existing');
 else if(/new business|start a business|starting/.test(lower))setSelectValue('stage','New');

 const incomeMatch=text.match(/(?:annual income|income)(?: is| of| around)?\s*([^,.]+)/i);
 if(incomeMatch){const n=wordsToNumber(incomeMatch[1]);if(n)document.getElementById('income').value=n;}

 const fundingMatch=text.match(/(?:funding required|funding|loan required|need)(?: is| of| around)?\s*([^,.]+)/i);
 if(fundingMatch){const n=wordsToNumber(fundingMatch[1]);if(n)document.getElementById('funding').value=n;}

 voiceStatus.textContent='✓ Voice captured. I filled the fields I could understand. Please verify the profile before matching schemes.';
}

if(SpeechRecognition){
 recognition=new SpeechRecognition();
 recognition.continuous=false;
 recognition.interimResults=false;
 recognition.maxAlternatives=1;

 document.getElementById('startVoice').addEventListener('click',()=>{
   recognition.lang=document.getElementById('voiceLanguage').value;
   voiceStatus.textContent='🎤 Listening... Speak your profile now.';
   voiceTranscript.textContent='Listening...';
   try{recognition.start();}catch(e){}
 });

 document.getElementById('stopVoice').addEventListener('click',()=>{
   try{recognition.stop();}catch(e){}
 });

 recognition.onresult=e=>{
   const text=e.results[0][0].transcript;
   voiceTranscript.textContent='You said: '+text;
   fillProfileFromSpeech(text);
 };
 recognition.onerror=e=>{
   voiceStatus.textContent='Voice error: '+e.error+'. Please allow microphone permission and try again.';
 };
 recognition.onend=()=>{
   if(voiceStatus.textContent.includes('Listening'))voiceStatus.textContent='Listening stopped. Tap the microphone to try again.';
 };
}else{
 document.getElementById('startVoice').disabled=true;
 document.getElementById('stopVoice').disabled=true;
 voiceStatus.textContent='Voice recognition is not supported in this browser. Please use Chrome/Edge or fill the form manually.';
}

function renderSchemes(){
 const cat=document.getElementById('category').value;
 const gender=document.getElementById('gender').value;
 const funding=Number(document.getElementById('funding').value||0);
 let data=schemes.map((s,i)=>({...s,match:Math.max(55,Math.min(97,s.match+(cat==='SC'?2:0)+(gender==='Female'?2:0)-(funding>1000000?8:0)-i))}));
 document.getElementById('schemeResults').innerHTML=data.map((s,i)=>`<div class="scheme"><div><h4>${s.name}</h4><p>${s.why.map(x=>'✓ '+x).join('<br>')}</p><div class="why">Explainable demo: hard rules are separated from ranking.</div><button class="secondary choose" data-i="${i}">Select this scheme</button></div><div class="score">${s.match}% match</div></div>`).join('');
 document.querySelectorAll('.choose').forEach(b=>b.addEventListener('click',()=>selectScheme(data[Number(b.dataset.i)])));
 show('eligibility');
}

document.getElementById('findSchemes').addEventListener('click',renderSchemes);

function selectScheme(s){
 state.selected=s;
 renderDocs(s.docs);
 document.getElementById('compatibilityText').textContent=`For ${s.name}, this MVP shows a compatibility layer that would validate official non-cumulation and overlap rules before suggesting: ${s.compatible.join(' + ')}.`;
 updateReadiness();
 show('documents');
}

function safeId(text){return text.toLowerCase().replace(/[^a-z0-9]+/g,'-');}

function renderDocs(docs){
 state.docs={};
 const list=document.getElementById('docChecklist');
 list.innerHTML=docs.map(d=>{
   const uploaded=!!state.files[d];
   state.docs[d]=uploaded;
   const id='file-'+safeId(d);
   const fileName=uploaded?state.files[d].name:'No file selected';
   return `<div class="doc-item" style="display:block;padding:14px;margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:8px;">
        <strong>${d}</strong>
        <span class="${uploaded?'status-ok':'status-miss'}" id="status-${safeId(d)}">${uploaded?'Uploaded':'Missing'}</span>
      </div>
      <input class="docfile" id="${id}" data-doc="${d}" type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" />
      <small id="name-${safeId(d)}" style="display:block;margin-top:6px;opacity:.75;">${fileName}</small>
   </div>`;
 }).join('');

 document.querySelectorAll('.docfile').forEach(input=>input.addEventListener('change',()=>{
   const doc=input.dataset.doc;
   const file=input.files&&input.files[0];
   if(file){
     state.files[doc]=file;
     state.docs[doc]=true;
     document.getElementById('status-'+safeId(doc)).textContent='Uploaded';
     document.getElementById('status-'+safeId(doc)).className='status-ok';
     document.getElementById('name-'+safeId(doc)).textContent=`✓ ${file.name}`;
   }else{
     delete state.files[doc];
     state.docs[doc]=false;
     document.getElementById('status-'+safeId(doc)).textContent='Missing';
     document.getElementById('status-'+safeId(doc)).className='status-miss';
     document.getElementById('name-'+safeId(doc)).textContent='No file selected';
   }
   updateReadiness();
 }));
}

function normalized(s){return s.toLowerCase().replace(/[^a-z]/g,'').replace(/kh/g,'h').replace(/sh/g,'s');}
function similarity(a,b){
 a=normalized(a);b=normalized(b);if(!a||!b)return 0;
 const longer=a.length>=b.length?a:b,shorter=a.length>=b.length?b:a;
 let common=0,j=0;for(const ch of longer){const k=shorter.indexOf(ch,j);if(k>=0){common++;j=k+1;}}
 return Math.round((common/Math.max(a.length,b.length))*100);
}

document.getElementById('checkName').addEventListener('click',()=>{
 const a=document.getElementById('primaryName').value,b=document.getElementById('certificateName').value;
 const score=similarity(a,b);
 state.nameVerified=score>=75;
 const msg=score>=75?`⚠ Possible variation detected (${score}% similarity). Please verify before submission.`:`⚠ Low similarity (${score}%). Manual verification is recommended.`;
 document.getElementById('nameResult').textContent=msg;
 updateReadiness();
});

function updateReadiness(){
 const vals=Object.values(state.docs);
 const docScore=vals.length?vals.filter(Boolean).length/vals.length*60:0;
 const schemeScore=state.selected?20:0;
 const nameScore=state.nameVerified?5:0;
 const dprScore=document.getElementById('dprPreview').dataset.done==='1'?15:0;
 const total=Math.min(100,Math.round(docScore+schemeScore+nameScore+dprScore));
 document.getElementById('heroScore').textContent=total+'%';
}

document.getElementById('generateDpr').addEventListener('click',()=>{
 const name=document.getElementById('name').value,business=document.getElementById('business').value;
 const funding=Number(document.getElementById('funding').value||0),equipment=document.getElementById('equipment').value;
 const equipmentCost=Number(document.getElementById('equipmentCost').value||0),rent=Number(document.getElementById('rent').value||0),employees=Number(document.getElementById('employees').value||0),sales=Number(document.getElementById('sales').value||0);
 const annualSales=sales*12,annualRent=rent*12;
 const text=`DPR DRAFT — ${business}\n\nApplicant: ${name}\nBusiness Stage: ${document.getElementById('stage').value}\nFunding Required: ₹${funding.toLocaleString('en-IN')}\n\nPROJECT SETUP\nEquipment: ${equipment}\nEquipment Cost: ₹${equipmentCost.toLocaleString('en-IN')}\nEmployees: ${employees}\n\nFINANCIAL SNAPSHOT\nExpected Annual Sales: ₹${annualSales.toLocaleString('en-IN')}\nAnnual Rent: ₹${annualRent.toLocaleString('en-IN')}\n\nNote: This is an editable MVP draft. Financial assumptions must be verified before official use.`;
 const box=document.getElementById('dprPreview');box.textContent=text;box.dataset.done='1';
 updateReadiness();
});

renderSchemes();