/* GWC V33.4 — Student self-service QR fee payment and monthly slip submission.
   Additive patch: keeps existing accounts, credentials, settings, modules and admin workflows. */
(function(){
  const A=x=>Array.isArray(x)?x:[];
  const escFee=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad=n=>String(n).padStart(2,'0');
  const todayLocal=()=>{const d=new Date();return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());};
  const monthKeyFromDate=s=>{const d=new Date(String(s||'').slice(0,10)+'T00:00:00');return isNaN(d)?todayLocal().slice(0,7):d.getFullYear()+'-'+pad(d.getMonth()+1);};
  const monthLabel=(y,m)=>new Intl.DateTimeFormat('en-IN',{month:'long',year:'numeric'}).format(new Date(Number(y),Number(m)-1,1));
  const selectedDefault=(st)=>{
    const due=String(st?.nextPaymentDate||'').slice(0,10);
    const d=/^\d{4}-\d{2}-\d{2}$/.test(due)?new Date(due+'T00:00:00'):new Date();
    return {year:Math.max(2026,d.getFullYear()),month:d.getFullYear()<2026?new Date().getMonth()+1:d.getMonth()+1};
  };
  window.gwc33StudentMonthChanged=function(){
    const y=document.getElementById('gwc33FeeYear')?.value,m=document.getElementById('gwc33FeeMonth')?.value;
    const out=document.getElementById('gwc33FeeMonthLabel');if(out&&y&&m)out.textContent=monthLabel(y,m);
  };
  window.gwc33SubmitStudentFee=async function(e,cid,sid,fee,days){
    e.preventDefault();
    const y=String(new FormData(e.target).get('feeYear')||''),m=String(new FormData(e.target).get('feeMonth')||'');
    if(!/^20\d{2}$/.test(y)||!/^([1-9]|1[0-2])$/.test(m)){alert('Payment month aur year select karein.');return;}
    const label=monthLabel(y,m);
    if(typeof window.gwcSubmitFeeSlip!=='function'){alert('Fee submission module available nahi hai.');return;}
    return window.gwcSubmitFeeSlip(e,cid,sid,label,fee,days);
  };
  const oldOpenSlip=window.gwcOpenSlipForm;
  window.gwcOpenSlipForm=function(cid,sid,month,fee,days){
    if(!sid)return oldOpenSlip.apply(this,arguments);
    const st=A(state.students).find(x=>String(x.id)===String(sid));
    const c=A(state.courses).find(x=>String(x.id)===String(cid));if(!st||!c)return;
    const def=selectedDefault(st),years=Array.from({length:31},(_,i)=>2026+i);
    const yearOptions=years.map(y=>`<option value="${y}" ${y===def.year?'selected':''}>${y}</option>`).join('');
    const monthOptions=Array.from({length:12},(_,i)=>i+1).map(m=>`<option value="${m}" ${m===def.month?'selected':''}>${new Intl.DateTimeFormat('en-IN',{month:'long'}).format(new Date(2026,m-1,1))}</option>`).join('');
    const qr=String(state.settings?.defaultQrUrl||c.qrUrl||'').trim();
    modal(`<span class="pill">Fee Payment · Student Portal</span><h3 style="color:var(--navy)">Upload Your Fee Slip</h3>
      <div class="panel" style="box-shadow:none"><p><b>Student:</b> ${escFee(st.name)}</p><p><b>Father:</b> ${escFee(st.father||'—')}</p><p><b>Class:</b> ${escFee(st.classNo||c.classNo||'—')} · ${escFee(c.title)}</p><p><b>Mobile:</b> ${escFee(st.mobile||'—')}</p><p><b>Address:</b> ${escFee(st.address||'—')}</p><p><b>Fee:</b> ${money(fee)}</p></div>
      <form onsubmit="gwc33SubmitStudentFee(event,'${escFee(cid)}','${escFee(sid)}',${Number(fee)||0},${Number(days)||30})">
      <div class="formgrid"><div class="field"><label>Payment Month *</label><select id="gwc33FeeMonth" name="feeMonth" onchange="gwc33StudentMonthChanged()">${monthOptions}</select></div><div class="field"><label>Payment Year *</label><select id="gwc33FeeYear" name="feeYear" onchange="gwc33StudentMonthChanged()">${yearOptions}</select></div><div class="field full"><div class="notice">Selected fee cycle: <b id="gwc33FeeMonthLabel">${escFee(monthLabel(def.year,def.month))}</b></div></div>
      <div class="field"><label>Student Name *</label><input name="name" value="${escFee(st.name||'')}" required></div><div class="field"><label>Father Name *</label><input name="father" value="${escFee(st.father||'')}" required></div><div class="field"><label>Class *</label><input name="classNo" value="${escFee(st.classNo||c.classNo||'')}" readonly required></div><div class="field"><label>Parent Mobile *</label><input name="mobile" value="${escFee(st.mobile||'')}" type="tel" pattern="[0-9+() -]{8,18}" required></div><div class="field full"><label>Full Address *</label><textarea name="address" required>${escFee(st.address||'')}</textarea></div><div class="field full"><label>Upload Your Fee Slip (JPG / PNG / WEBP / PDF; max 1 MB) *</label><input name="slip" type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" required></div></div>
      <div class="notice">Admin payment slip verify karke approval dega. Approval se pehle course access activate nahi hoga. Duplicate pending/approved month submission blocked rahega.</div><button class="primary" style="width:100%;margin-top:14px">Submit Fee Slip for Admin Approval</button></form>`);
  };
  const oldOpenFlow=window.gwcOpenFeeFlow;
  window.gwcOpenFeeFlow=function(cid,sid){
    if(!sid)return oldOpenFlow.apply(this,arguments);
    const c=A(state.courses).find(x=>String(x.id)===String(cid)),st=A(state.students).find(x=>String(x.id)===String(sid));if(!c||!st)return;
    if(st.status==='rejected'){alert('Is fee request ko reject kiya gaya tha. Admin se sampark karein.');return;}
    const fee=typeof gwcFeeFor==='function'?gwcFeeFor(st,c):Number(st.studentFee??st.fee??c.fee??0);
    const days=Number(st.validityDays||c.validityDays||30),qr=String(state.settings?.defaultQrUrl||c.qrUrl||'').trim();
    const qrMarkup=qr?`<div class="notice success">Admin ka Default Payment QR</div><a href="${escFee(gwcImageUrl(qr))}" target="_blank" rel="noopener"><img src="${escFee(gwcImageUrl(qr))}" alt="Default fee payment QR" style="display:block;width:min(300px,82vw);max-width:100%;max-height:65vh;object-fit:contain;margin:12px auto"></a>`:'<div class="notice error">Admin ne Default Payment Settings mein QR upload nahi kiya hai. Kripya Admin se sampark karein.</div>';
    modal(`<span class="pill">Pay Your Fee</span><h3 style="color:var(--navy)">Course Fee Payment</h3><div class="panel" style="box-shadow:none"><p><b>Student:</b> ${escFee(st.name)} · <b>Class:</b> ${escFee(st.classNo||c.classNo||'')}</p><p><b>Course:</b> ${escFee(c.title)}</p><p><b>Monthly Fee:</b> ${money(fee)}</p>${qrMarkup}</div><p class="notice">QR scan karke payment karein. Payment ke baad neeche button se month/year select karke fee slip upload karein. Admin verify karega.</p><button class="primary" style="width:100%" ${qr?'':'disabled'} onclick="gwcOpenSlipForm('${escFee(cid)}','${escFee(sid)}','',${fee},${days})">I Have Paid — Upload Your Fee Slip</button><button class="outline" style="width:100%;margin-top:8px" onclick="closeModal()">Cancel</button>`);
  };
  // Student My Course view: show payment CTA whenever the monthly validity is expired,
  // access is paused, or an admin has disabled course access. Keep all other tabs untouched.
  const oldStudent=window.renderStudent;
  if(typeof oldStudent==='function')window.renderStudent=function(r){
    if(tab==='mycourse'&&current?.role==='student'){
      const st=A(state.students).find(x=>String(x.userId)===String(current.id)||String(x.id)===String(current.id));
      if(!st){r.innerHTML='<div class="dashhead"><h1>🎓 My Course</h1></div><div class="panel">Student record nahi mila. Admin se sampark karein.</div>';return;}
      const c=A(state.courses).find(x=>String(x.id)===String(st.courseId||st.requestedCourseId));
      if(!c){r.innerHTML='<div class="dashhead"><h1>🎓 My Course</h1></div><div class="panel">Course assign nahi hai. Admin se sampark karein.</div>';return;}
      const period=typeof window.gwcCurrentPeriod==='function'?window.gwcCurrentPeriod(st):null;
      const today=todayLocal(),periodEnd=period?String(period.endAt).slice(0,10):'';
      const active=!!period&&periodEnd>=today&&st.adminPaused!==true&&st.courseAccessActive!==false;
      const t=typeof teacherForCourse==='function'?teacherForCourse(c):A(state.users).find(u=>u.id===c.teacherId);
      const meet=String(t?.meetUrl||c.meetUrl||'').trim();
      const fee=typeof gwcFeeFor==='function'?gwcFeeFor(st,c):Number(st.studentFee??st.fee??c.fee??0);
      const validFrom=period?String(period.startAt).slice(0,10):'';
      const validTo=period?new Date(new Date(period.endAt).getTime()-86400000).toISOString().slice(0,10):'';
      const d=s=>s?new Date(s+'T00:00:00').toLocaleDateString('en-IN'):'—';
      const pending=A(state.feeRequests).some(q=>String(q.studentId)===String(st.id)&&q.status==='pending');
      const payCard=!active?`<div class="panel"><h3>💳 Pay Your Fee</h3><p class="notice error">Course access band hai ya fee payment date over ho chuki hai. QR scan karke payment karein aur fee slip upload karein. Admin approval ke baad access resume hoga.</p><p><b>Monthly Fee:</b> ${money(fee)}</p>${pending?'<p class="notice">Aapki fee slip Admin verification ke liye pending hai. Duplicate submission na karein.</p>':''}<button class="primary" style="width:100%;min-height:48px" onclick="gwcOpenFeeFlow('${escFee(c.id)}','${escFee(st.id)}')">💳 Pay Your Fee & Upload Slip</button></div>`:'';
      const activePay=`<button class="outline" style="width:100%;margin-top:10px" onclick="gwcOpenFeeFlow('${escFee(c.id)}','${escFee(st.id)}')">Pay Your Fee / Renew</button>`;
      r.innerHTML=`<div class="dashhead"><h1>🎓 My Course</h1></div><div class="panel"><h3>${escFee(c.title)}</h3><p>Class ${escFee(c.classNo||st.classNo||'')} · Section ${escFee(c.section||'')} · Batch ${escFee(c.subsection||'')}</p><p>Teacher: <b>${escFee(t?.name||'Not assigned')}</b></p><p>Monthly Student Fee: <b>${money(fee)}</b></p><p>Fee validity: <b>${d(validFrom)} – ${d(validTo)}</b></p>${active&&meet?`<a class="primary btn" style="display:inline-block;margin-top:8px" href="${escFee(meet)}" target="_blank" rel="noopener noreferrer">Join My Class ↗</a>`:active?'<p class="notice">Fee valid hai, lekin Teacher ka Meet link update nahi hai.</p>': '<p class="notice error">Course access inactive hai.</p>'}${active?activePay:''}</div>${payCard}`;
      return;
    }
    return oldStudent.apply(this,arguments);
  };
  // On fee approval, mirror the approved cycle into the V32.2 monthly validity register.
  // This makes the Student Portal's date-based access gate and Admin's monthly register agree.
  const oldApprove=window.gwcApproveFeeRequest;
  if(typeof oldApprove==='function')window.gwcApproveFeeRequest=function(rid){
    oldApprove.apply(this,arguments);
    const req=A(state.feeRequests).find(x=>String(x.id)===String(rid));
    if(!req||req.status!=='approved'||!req.startAt||!req.endAt)return;
    const st=A(state.students).find(x=>String(x.id)===String(req.studentId));if(!st)return;
    state.gwcMonthlyFees=A(state.gwcMonthlyFees);
    const ym=monthKeyFromDate(req.startAt),rec=state.gwcMonthlyFees.find(x=>String(x.studentId)===String(st.id)&&String(x.month)===ym)||{id:'FEE-'+st.id+'-'+ym,studentId:st.id,month:ym};
    rec.validFrom=String(req.startAt).slice(0,10);rec.validTo=String(req.endAt).slice(0,10);rec.feeAmount=Number(req.amount||st.studentFee||st.fee||0);rec.paymentDate=String(req.submittedAt||new Date().toISOString()).slice(0,10);rec.slipUrl=req.slip||rec.slipUrl||'';rec.slipName=req.slipName||rec.slipName||'';rec.uploadedBy='student';rec.approvedRequestId=req.id;rec.approvedAt=req.approvedAt||new Date().toISOString();
    if(!state.gwcMonthlyFees.some(x=>x===rec))state.gwcMonthlyFees.push(rec);
    st.courseAccessActive=st.adminPaused!==true&&String(rec.validFrom)<=todayLocal()&&String(rec.validTo)>=todayLocal();
    if(typeof save==='function')save();
  };
})();
