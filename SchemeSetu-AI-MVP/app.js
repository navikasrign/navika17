const schemes=[
 {name:'PMEGP',match:94,why:['New business supported','Funding need within demo range','Profile fits entrepreneurship support'],docs:['Aadhaar','PAN','Community Certificate','Income Certificate','Bank Statement','DPR'],compatible:['Training support','Eligible credit-linked assistance']},
 {name:'Stand-Up India',match:88,why:['Women entrepreneur profile','Greenfield enterprise intent','Funding requirement can be evaluated'],docs:['Aadhaar','PAN','Community Certificate','Bank Statement','Business Plan'],compatible:['Handholding support','Bank-linked assistance']},
 {name:'NSFDC Entrepreneurship Support',match:83,why:['SC category selected','Entrepreneurship objective matches','Income rule requires official validation'],docs:['Aadhaar','PAN','Community Certificate','Income Certificate','Bank Statement','Project Report'],compatible:['Skill/training support','Eligible finance support']}
];

const state={selected:null,docs:{}};
const steps=[...document.querySelectorAll('.step')];
const panels=[...document.querySelectorAll('.panel')];

function show(id){
 panels.forEach(p=>p.classList.toggle('active-panel',p.id===id));
 steps.forEach(s=>s.classList.toggle('active',s.dataset.target===id));
 document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
}
steps.forEach(s=>s.addEventListener('click',()=>show(s.dataset.target)));

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

function renderDocs(docs){
 const preset={'Aadhaar':true,'PAN':true,'Community Certificate':true,'Income Certificate':false,'Bank Statement':true,'DPR':false,'Business Plan':false,'Project Report':false};
 state.docs={};
 document.getElementById('docChecklist').innerHTML=docs.map((d,i)=>{
   state.docs[d]=preset[d]??false;
   return `<div class="doc-item"><label><input class="doccheck" data-doc="${d}" type="checkbox" ${state.docs[d]?'checked':''}/> ${d}</label><span class="${state.docs[d]?'status-ok':'status-miss'}">${state.docs[d]?'Ready':'Missing'}</span></div>`;
 }).join('');
 document.querySelectorAll('.doccheck').forEach(c=>c.addEventListener('change',()=>{
   state.docs[c.dataset.doc]=c.checked;
   const span=c.closest('.doc-item').querySelector('span');
   span.textContent=c.checked?'Ready':'Missing'; span.className=c.checked?'status-ok':'status-miss';
   updateReadiness();
 }));
}

function normalized(s){return s.toLowerCase().replace(/[^a-z]/g,'').replace(/kh/g,'h').replace(/sh/g,'s');}
function similarity(a,b){
 a=normalized(a);b=normalized(b); if(!a||!b)return 0;
 const longer=a.length>=b.length?a:b, shorter=a.length>=b.length?b:a;
 let common=0,j=0; for(const ch of longer){const k=shorter.indexOf(ch,j); if(k>=0){common++;j=k+1;}}
 return Math.round((common/Math.max(a.length,b.length))*100);
}

document.getElementById('checkName').addEventListener('click',()=>{
 const a=document.getElementById('primaryName').value,b=document.getElementById('certificateName').value;
 const score=similarity(a,b);
 const msg=score>=75?`⚠ Possible variation detected (${score}% similarity). Please verify before submission.`:`⚠ Low similarity (${score}%). Manual verification is recommended.`;
 document.getElementById('nameResult').textContent=msg;
 updateReadiness(score>=75?10:0);
});

function updateReadiness(extra=0){
 const vals=Object.values(state.docs); const docScore=vals.length?vals.filter(Boolean).length/vals.length*60:0;
 const schemeScore=state.selected?25:0;
 const dprScore=document.getElementById('dprPreview').dataset.done==='1'?15:0;
 const total=Math.min(100,Math.round(docScore+schemeScore+dprScore+extra));
 document.getElementById('heroScore').textContent=total+'%';
}

document.getElementById('generateDpr').addEventListener('click',()=>{
 const name=document.getElementById('name').value,business=document.getElementById('business').value;
 const funding=Number(document.getElementById('funding').value||0),equipment=document.getElementById('equipment').value;
 const equipmentCost=Number(document.getElementById('equipmentCost').value||0),rent=Number(document.getElementById('rent').value||0),employees=Number(document.getElementById('employees').value||0),sales=Number(document.getElementById('sales').value||0);
 const annualSales=sales*12, annualRent=rent*12;
 const text=`DPR DRAFT — ${business}\n\nApplicant: ${name}\nBusiness Stage: ${document.getElementById('stage').value}\nFunding Required: ₹${funding.toLocaleString('en-IN')}\n\nPROJECT SETUP\nEquipment: ${equipment}\nEquipment Cost: ₹${equipmentCost.toLocaleString('en-IN')}\nEmployees: ${employees}\n\nFINANCIAL SNAPSHOT\nExpected Annual Sales: ₹${annualSales.toLocaleString('en-IN')}\nAnnual Rent: ₹${annualRent.toLocaleString('en-IN')}\n\nNote: This is an editable MVP draft. Financial assumptions must be verified before official use.`;
 const box=document.getElementById('dprPreview'); box.textContent=text; box.dataset.done='1';
 if(state.docs['DPR']!==undefined) state.docs['DPR']=true;
 if(state.docs['Project Report']!==undefined) state.docs['Project Report']=true;
 renderDocs(state.selected?state.selected.docs:[]);
 updateReadiness();
});

renderSchemes();