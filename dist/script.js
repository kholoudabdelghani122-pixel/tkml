const menu=document.querySelector('.menu'),nav=document.querySelector('#navigation');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation')}));
const descriptions=['Every assignment begins with a clear requirement and an agreed scope. Specifications, priorities, and commercial constraints shape the next steps.','We identify relevant suppliers or partners and review information appropriate to the transaction. Review depth reflects the assignment, its risks, and the agreed scope.','We organise quotations, support commercial comparison, clarify open questions, and establish responsibilities between the parties.','We follow up on agreed actions, documentation, and delivery coordination within the defined scope, then look for opportunities to improve the process.'];
const steps=[...document.querySelectorAll('.step')],panel=document.querySelector('#process-detail');
function activate(index){steps.forEach((b,i)=>{b.classList.toggle('active',i===index);b.setAttribute('aria-selected',String(i===index));b.tabIndex=i===index?0:-1});panel.setAttribute('aria-labelledby','step-'+index);panel.querySelector('p').textContent=descriptions[index];panel.querySelector('.process-index').textContent='0'+(index+1)+' / 04'}
steps.forEach((b,i)=>{b.addEventListener('click',()=>activate(i));b.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight'||e.key==='ArrowDown')next=(i+1)%4;if(e.key==='ArrowLeft'||e.key==='ArrowUp')next=(i+3)%4;if(e.key==='Home')next=0;if(e.key==='End')next=3;if(next!==undefined){e.preventDefault();activate(next);steps[next].focus()}})});
const dialog=document.querySelector('#enquiry'),form=document.querySelector('#enquiry-form'),result=document.querySelector('#brief-result');let lastTrigger,brief='';
document.querySelectorAll('[data-enquiry]').forEach(b=>b.addEventListener('click',()=>{lastTrigger=b;if(b.dataset.enquiry)form.elements.type.value=b.dataset.enquiry;dialog.showModal()}));
function closeDialog(){dialog.close();lastTrigger?.focus()}
dialog.querySelector('.close').addEventListener('click',closeDialog);dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog()}});
form.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(form);brief=`TKML — Business enquiry\n\nName: ${d.get('name')}\nCompany: ${d.get('company')}\nEmail: ${d.get('email')}\nEnquiry type: ${d.get('type')}\n\nRequirement:\n${d.get('requirement')}\n`;document.querySelector('#brief-text').textContent=brief;form.hidden=true;result.hidden=false;document.querySelector('#copy-brief').focus()});
document.querySelector('#copy-brief').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(brief);document.querySelector('#copy-status').textContent='Brief copied. Ready to share with your TKML contact.'}catch{document.querySelector('#copy-status').textContent='Copy is unavailable in this browser. Please download the brief instead.'}});
document.querySelector('#download-brief').addEventListener('click',()=>{const u=URL.createObjectURL(new Blob([brief],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='TKML-Enquiry-Brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)});
document.querySelector('#edit-brief').addEventListener('click',()=>{result.hidden=true;form.hidden=false;form.elements.name.focus()});

const root=document.documentElement,pageHeader=document.querySelector('.header'),navLinks=[...nav.querySelectorAll('a[href^="#"]')];
function updatePageState(){
  pageHeader.classList.toggle('is-scrolled',scrollY>24);
  let current='';
  navLinks.forEach(link=>{const section=document.querySelector(link.getAttribute('href'));if(section&&section.getBoundingClientRect().top<=innerHeight*.38)current=link.getAttribute('href')});
  navLinks.forEach(link=>{if(link.getAttribute('href')===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current')});
}
let scrollQueued=false;
addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{updatePageState();scrollQueued=false})},{passive:true});
addEventListener('resize',updatePageState,{passive:true});
updatePageState();

if('IntersectionObserver' in window){
  root.classList.add('motion-ready');
  const revealTargets=document.querySelectorAll('.section-tag,.section-heading,.problem-grid,.bento,.steps,.process-detail,.center-heading,.standards-grid,.company-grid,.sectors,.vision-panel,.closing .wrap');
  revealTargets.forEach(target=>target.classList.add('reveal-ready'));
  const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');revealObserver.unobserve(entry.target)}}),{rootMargin:'0px 0px -10% 0px',threshold:.08});
  revealTargets.forEach(target=>revealObserver.observe(target));
}
