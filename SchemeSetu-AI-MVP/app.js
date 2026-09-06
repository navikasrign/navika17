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
   const file=input.files && input.files[0];
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
 a=normalized(a);b=normalized(b); if(!a||!b)return 0;
 const longer=a.length>=b.length?a:b, shorter=a.length>=b.length?b:a;
 let common=0,j=0; for(const ch of longer){const k=shorter.indexOf(ch,j); if(k>=0){common++;j=k+1;}}
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
 const annualSales=sales*12, annualRent=rent*12;
 const text=`DPR DRAFT — ${business}\n\nApplicant: ${name}\nBusiness Stage: ${document.getElementById('stage').value}\nFunding Required: ₹${funding.toLocaleString('en-IN')}\n\nPROJECT SETUP\nEquipment: ${equipment}\nEquipment Cost: ₹${equipmentCost.toLocaleString('en-IN')}\nEmployees: ${employees}\n\nFINANCIAL SNAPSHOT\nExpected Annual Sales: ₹${annualSales.toLocaleString('en-IN')}\nAnnual Rent: ₹${annualRent.toLocaleString('en-IN')}\n\nNote: This is an editable MVP draft. Financial assumptions must be verified before official use.`;
 const box=document.getElementById('dprPreview'); box.textContent=text; box.dataset.done='1';
 updateReadiness();
});

renderSchemes();