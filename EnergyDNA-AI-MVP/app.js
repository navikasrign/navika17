const audioInput=document.getElementById('audioFile');
const imageInput=document.getElementById('imageFile');
const analyzeBtn=document.getElementById('analyzeBtn');

imageInput.addEventListener('change',()=>{
  const preview=document.getElementById('imagePreview');
  const file=imageInput.files[0];
  if(!file){preview.textContent='No image selected';return;}
  const img=document.createElement('img');
  img.src=URL.createObjectURL(file);
  preview.innerHTML='';preview.appendChild(img);
});

function clamp(n,min,max){return Math.min(max,Math.max(min,n));}

async function extractAudioFeatures(file){
  const buffer=await file.arrayBuffer();
  const AudioCtx=window.AudioContext||window.webkitAudioContext;
  const ctx=new AudioCtx();
  const decoded=await ctx.decodeAudioData(buffer.slice(0));
  const ch=decoded.getChannelData(0);
  let sumSq=0,cross=0,peak=0;
  for(let i=0;i<ch.length;i++){
    const v=ch[i];sumSq+=v*v;peak=Math.max(peak,Math.abs(v));
    if(i>0 && ((ch[i-1]>=0&&v<0)||(ch[i-1]<0&&v>=0)))cross++;
  }
  const rms=Math.sqrt(sumSq/ch.length);
  const zcr=cross/ch.length;
  await ctx.close();
  return {rms,zcr,peak,duration:decoded.duration};
}

function buildResult(features,condition){
  const {rms,zcr,peak}=features;
  // Demo heuristic only: converts observable audio statistics into a screening score.
  let anomaly=0;
  anomaly+=clamp((rms-.08)*180,0,30);
  anomaly+=clamp((zcr-.08)*220,0,28);
  anomaly+=clamp((peak-.72)*60,0,18);
  if(condition==='noisy') anomaly+=22;
  if(condition==='hot') anomaly+=16;
  if(condition==='maintenance') anomaly-=8;
  anomaly=clamp(anomaly,4,92);
  const score=Math.round(100-anomaly);
  let status='Normal pattern',level='Low',priority='Routine',klass='good',rec='Continue normal operation and save this scan as part of the machine baseline. Repeat scans under similar load conditions to strengthen the Energy DNA profile.';
  if(anomaly>=55){status='Abnormal behaviour detected';level='High';priority='High',klass='bad';rec='Inspect the machine before extended operation. Check bearings, alignment, lubrication, loose components and operating load. Compare with a known healthy recording and escalate to a technician if the abnormal pattern persists.';}
  else if(anomaly>=30){status='Possible deviation detected';level='Medium';priority='Plan inspection',klass='warn';rec='A moderate deviation is present. Re-record the machine under the same operating condition, inspect for unusual vibration/noise and schedule preventive maintenance if the deviation repeats.';}
  return {score,status,level,priority,klass,rec};
}

function showDemoWithoutAudio(){
  const condition=document.getElementById('condition').value;
  const base={rms:condition==='noisy'?.19:.095,zcr:condition==='noisy'?.18:.085,peak:condition==='hot'?.88:.66,duration:5};
  return base;
}

analyzeBtn.addEventListener('click',async()=>{
  analyzeBtn.disabled=true;analyzeBtn.textContent='Analyzing machine signature…';
  try{
    const file=audioInput.files[0];
    const features=file?await extractAudioFeatures(file):showDemoWithoutAudio();
    const condition=document.getElementById('condition').value;
    const result=buildResult(features,condition);
    document.getElementById('resultMachine').textContent=document.getElementById('machineName').value||'Unnamed Machine';
    document.getElementById('scoreValue').textContent=result.score;
    document.getElementById('rmsValue').textContent=features.rms.toFixed(4);
    document.getElementById('zcrValue').textContent=features.zcr.toFixed(4);
    document.getElementById('anomalyValue').textContent=result.level;
    document.getElementById('priorityValue').textContent=result.priority;
    const st=document.getElementById('statusText');st.textContent=result.status;st.className='status '+result.klass;
    document.getElementById('recommendationText').textContent=result.rec;
    document.getElementById('resultCard').scrollIntoView({behavior:'smooth',block:'center'});
  }catch(err){
    alert('This audio format could not be decoded by your browser. Try WAV or MP3. You can also run the demo without uploading audio.');
  }finally{analyzeBtn.disabled=false;analyzeBtn.textContent='Run EnergyDNA Analysis';}
});
