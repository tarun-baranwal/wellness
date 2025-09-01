/* ========== AUDIO (WebAudio) ========== */
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTone(freq=440,type='sine',duration=0.14,gain=0.06){try{const osc=audioCtx.createOscillator();const g=audioCtx.createGain();osc.type=type;osc.frequency.value=freq;g.gain.value=0;osc.connect(g);g.connect(audioCtx.destination);const now=audioCtx.currentTime;g.gain.linearRampToValueAtTime(gain,now+0.005);osc.start(now);g.gain.linearRampToValueAtTime(0.0001,now+duration);osc.stop(now+duration+0.02);}catch(e){}}
function playSuccess(){ playTone(880,'sine',0.14,0.08); playTone(1320,'sine',0.08,0.06)}
function playClick(){ playTone(880,'triangle',0.06,0.04)}
function playCalm(){ playTone(220,'sine',0.35,0.05)}

/* ========== TOASTS (animated) ========== */
const toastContainer = document.getElementById('toast');
function toast(msg,type='info',timeout=2800){const el=document.createElement('div');el.className='toast '+(type==='success'?'success':'info');el.innerHTML=`<div style="display:flex;align-items:center;gap:10px"><div style="font-weight:800">${type==='success'?'✓':'i'}</div><div style="flex:1">${msg}</div></div>`;toastContainer.appendChild(el);if(type==='success')playSuccess();else playClick();setTimeout(()=>{el.classList.add('hide');setTimeout(()=>el.remove(),300);},timeout);} 

/* ========== NOTIFICATIONS (Web Notification API) ========== */
function requestNotifyPerm(){ if(!('Notification' in window)){ toast('Notifications not supported in this browser.'); return; } Notification.requestPermission().then(p => { if(p==='granted'){ toast('Notifications enabled','success'); sendLocalNotification('MindCare active','You will receive friendly check-in reminders.'); } else { toast('Notifications denied'); }});
}
function sendLocalNotification(title, body){ if(Notification.permission==='granted'){ new Notification(title,{body:body,icon:''}); playClick(); } else { toast('Enable notifications to receive reminders'); }}

/* ========== DATA & STATE ========== */
const AFFIRMATIONS = ["You are stronger than you think.","Every day is a fresh start full of possibilities.","Your feelings are valid.","Small steps are progress.","You deserve kindness — from others and yourself."];
const MOODS = [ {label:'😊 Happy', key:'happy', game:'memory'}, {label:'😐 Okay', key:'okay', game:'zen'}, {label:'😟 Stressed', key:'stressed', game:'breath'}, {label:'😢 Sad', key:'sad', game:'puzzle'}, {label:'😠 Angry', key:'angry', game:'tap'}, {label:'😴 Tired', key:'tired', game:'zen'}, {label:'🤔 Anxious', key:'anxious', game:'zen'}, {label:'😍 Excited', key:'excited', game:'memory'}, {label:'😨 Nervous', key:'nervous', game:'breath'}, {label:'😎 Confident', key:'confident', game:'memory'}, {label:'😩 Overwhelmed', key:'overwhelmed', game:'breath'}, {label:'😬 Guilty', key:'guilty', game:'puzzle'}, {label:'😇 Hopeful', key:'hopeful', game:'memory'}, {label:'🤯 Burned Out', key:'burnedout', game:'breath'}, {label:'😍 Loved', key:'loved', game:'memory'} ];
const QUIZZES = { happy:{questions:["Do you want to share your happiness?","Are you motivated to start a small task?","Do you want to note something you're grateful for?"], feeling:"joyful", why:"Positive events or rest often produce joy.", advice:"Share the moment, write a gratitude line, or channel energy into a small creative task."}, stressed:{questions:["Do tasks feel overwhelming?","Is your sleep disturbed?","Do you feel body tension?"], feeling:"overwhelmed", why:"High demands or deadlines create stress.", advice:"Break tasks into tiny steps, try the breathing game, and take short walks."}, /* truncated for brevity in creation */ };

/* ========== STORAGE ========== */
let points = Number(localStorage.getItem('mw_points') || 0);
let checkins = JSON.parse(localStorage.getItem('mw_checkins') || '[]');
let streak = Number(localStorage.getItem('mw_streak') || 0);

/* profile storage */
let profile = JSON.parse(localStorage.getItem('mw_profile') || '{}');

/* UI refs */
const affirmationEl = document.getElementById('affirmationText');
const moodGrid = document.getElementById('moodGrid');
const quizArea = document.getElementById('quizArea');
const quizTitle = document.getElementById('quizTitle');
const quizQuestions = document.getElementById('quizQuestions');
const resultArea = document.getElementById('resultArea');
const feelingEl = document.getElementById('feelingText');
const whyEl = document.getElementById('whyText');
const adviceEl = document.getElementById('adviceText');
const pointsEl = document.getElementById('points');
const streakEl = document.getElementById('streak');
const badgesEl = document.getElementById('badges');
const calendarEl = document.getElementById('calendar');
const chatInput = document.getElementById('chatInput');
const chatOutput = document.getElementById('chatOutput');
const modal = document.getElementById('modal');
const gameTitle = document.getElementById('gameTitle');
const gameDesc = document.getElementById('gameDesc');
const timerEl = document.getElementById('timer');
let chosenMood = null;

/* ========== AFFIRMATION ========== */
function newAffirmation(){ const idx = (new Date().getDate()) % AFFIRMATIONS.length; affirmationEl.innerText = AFFIRMATIONS[idx]; playClick(); }
newAffirmation();


/* ========== THEME ========== */
function toggleTheme(){ document.body.classList.toggle('dark'); playClick(); }

/* ========== RENDER MOODS ========== */
MOODS.forEach(m => { const div=document.createElement('div');div.className='mood-btn slide-left';const emoji=m.label.split(' ')[0];const text=m.label.split(' ').slice(1).join(' ');div.innerHTML=`<div class="emoji">${emoji}</div><div>${text}</div>`;div.onclick=()=>onMoodSelect(m.key);moodGrid.appendChild(div);});

/* ========== MOOD SELECT + QUIZ ========== */
function onMoodSelect(key){ chosenMood=key; const q = QUIZZES[key] || QUIZZES['stressed']; quizTitle.innerText = `Quick check — ${key}`; quizQuestions.innerHTML=''; (q.questions||[]).forEach((question,i)=>{ const block=document.createElement('div'); block.className='question grow'; block.innerHTML = `<div style="font-weight:800">${i+1}. ${question}</div><div style="margin-top:8px"><label><input type="radio" name="q${i}" value="yes"> Yes</label><label style="margin-left:12px"><input type="radio" name="q${i}" value="no"> No</label></div>`; quizQuestions.appendChild(block); }); quizArea.style.display='block'; resultArea.style.display='none'; playClick(); window.scrollTo({top:0,behavior:'smooth'}); }

function submitQuiz(){ if(!chosenMood){ toast('Select a mood first'); return; } const q = QUIZZES[chosenMood] || QUIZZES['stressed']; let score=0; (q.questions||[]).forEach((_,i)=>{ const sel=document.querySelector(`input[name="q${i}"]:checked`); if(sel && sel.value==='yes') score++; }); showResult(score,q); awardPointsForQuiz(score); }
function skipQuiz(){ if(!chosenMood){ toast('Select a mood first'); return; } const q = QUIZZES[chosenMood] || QUIZZES['stressed']; showResult(null,q); awardPointsForQuiz(null); }

/* ========== AWARD POINTS & CHECK-IN ========== */
function awardPointsForQuiz(score){ let base=8; if(score!==null) base+=score*2; points += base; const today=new Date().toDateString(); if(!checkins.includes(today)){ checkins.push(today); localStorage.setItem('mw_checkins',JSON.stringify(checkins)); } streak = computeStreak(checkins); saveState(); updateUI(); toast(`Saved — +${base} points`,'success'); }

/* ========== SHOW RESULT ========== */
function showResult(score,q){ quizArea.style.display='none'; resultArea.style.display='block'; feelingEl.innerText = `Feeling: ${q.feeling || chosenMood}`; whyEl.innerText = `Why: ${q.why || ''}`; adviceEl.innerHTML = `<div style="margin-top:8px">${q.advice || ''}</div>` + (score===null? '':`<div style="margin-top:10px;font-weight:800">Quiz: ${score}/${(q.questions||[]).length}</div>`); gameTitle.innerText = `Game suggested: ${mapGame(chosenMood)}`; }

function doneAdvice(){ resultArea.style.display='none'; toast('Nice job checking in!','success'); playSuccess(); }

/* ========== DASHBOARD ========== */
function openDashboard(){ document.getElementById('dashModal').classList.add('show'); renderDashboard(); }
function closeDashboard(){ document.getElementById('dashModal').classList.remove('show'); }
function renderDashboard(){ // weekly bars (last 7 days)
  const wrap = document.getElementById('weekBars'); wrap.innerHTML=''; const now=new Date(); const last7 = []; for(let i=6;i>=0;i--){ const d=new Date(now); d.setDate(now.getDate()-i); last7.push(d.toDateString()); }
  const counts = last7.map(day => checkins.filter(c=>c===day).length);
  counts.forEach((c, idx)=>{ const row = document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.gap='8px'; const label=document.createElement('div'); label.style.width='48px'; label.className='small muted'; label.innerText = new Date(last7[idx]).toLocaleDateString(undefined,{weekday:'short'}).slice(0,3); const barWrap=document.createElement('div'); barWrap.style.flex='1'; barWrap.className='stat-bar'; const inner=document.createElement('i'); inner.style.width = Math.min(100, c*25) + '%'; barWrap.appendChild(inner); const val=document.createElement('div'); val.style.width='36px'; val.className='small muted'; val.innerText = c>0? c : ''; row.appendChild(label); row.appendChild(barWrap); row.appendChild(val); wrap.appendChild(row); });
  document.getElementById('dashPoints').innerText = points; document.getElementById('dashStreak').innerText = (streak||0)+' days'; document.getElementById('dashCheckins').innerText = checkins.filter(d=> new Date(d).getMonth() === new Date().getMonth()).length; }

/* ========== MAP MOOD => GAME NAME ========== */
function mapGame(mood){ const map = { stressed:'Breathing', sad:'Puzzle Swap', angry:'Tap Smash', happy:'Memory Match', anxious:'Zen Click', burnedout:'Breathing', nervous:'Breathing', tired:'Zen Click', guilty:'Puzzle Swap', confident:'Memory Match', loved:'Memory Match' }; return map[mood] || 'Breathing'; }

/* ========== OPEN GAME ========== */
function openGame(){ if(!chosenMood){ toast('Complete a check-in first.'); return; } const gameKey = (MOODS.find(m=>m.key===chosenMood)||{}).game || 'breath'; document.getElementById('modal').classList.add('show'); timerEl.innerText=''; ['breathGame','memoryGame','tapGame','puzzleGame','zenGame'].forEach(id=>document.getElementById(id).style.display='none'); if(gameKey==='breath'){ document.getElementById('breathGame').style.display='block'; gameTitle.innerText='Breathing Exercise'; gameDesc.innerText='Follow guided inhales and exhales for 60s.'; } if(gameKey==='memory'){ setupMemory(); document.getElementById('memoryGame').style.display='block'; gameTitle.innerText='Memory Match'; gameDesc.innerText='Flip & match pairs.'; } if(gameKey==='tap'){ document.getElementById('tapGame').style.display='block'; gameTitle.innerText='Tap Smash'; gameDesc.innerText='Tap targets quickly.'; } if(gameKey==='puzzle'){ setupPuzzle(); document.getElementById('puzzleGame').style.display='block'; gameTitle.innerText='Sliding Puzzle'; gameDesc.innerText='Reorder tiles to complete the grid.'; } if(gameKey==='zen'){ zenReset(); document.getElementById('zenGame').style.display='block'; gameTitle.innerText='Zen Click'; gameDesc.innerText='Slow calm clicks give small bonuses.'; } playCalm(); }

function closeModal(){ document.getElementById('modal').classList.remove('show'); stopAllGames(); timerEl.innerText=''; playClick(); }

/* ========== STREAK CALC & UI ========== */
function computeStreak(list){ if(!list.length) return 0; const set=new Set(list); let count=0; const day=new Date(); while(set.has(day.toDateString())){ count++; day.setDate(day.getDate()-1);} return count; }
function saveState(){ localStorage.setItem('mw_points',String(points)); localStorage.setItem('mw_checkins',JSON.stringify(checkins)); localStorage.setItem('mw_streak',String(streak)); }
function updateUI(){ pointsEl.innerText = points; streakEl.innerText = (streak||0)+' days'; badgesEl.innerHTML=''; if(points>=50) badgesEl.innerHTML += '<div class="badge">Calm Hero</div>'; if(points>=120) badgesEl.innerHTML += '<div class="badge">Mental Master</div>'; if(streak>=3) badgesEl.innerHTML += '<div class="badge">Consistency Star</div>'; drawCalendar(); }
updateUI();
function drawCalendar(){ calendarEl.innerHTML=''; const now=new Date(); const year=now.getFullYear(); const month=now.getMonth(); const first=new Date(year,month,1).getDay(); const days=new Date(year,month+1,0).getDate(); for(let i=0;i<first;i++){ const el=document.createElement('div'); el.className='day'; calendarEl.appendChild(el);} for(let d=1; d<=days; d++){ const dateStr = new Date(year,month,d).toDateString(); const el=document.createElement('div'); el.className='day'; el.innerText=d; if(checkins.includes(dateStr)) el.classList.add('checked'); calendarEl.appendChild(el);} }

/* ========== GAMES (memory completed) ========== */
/* ---- Breathing ---- */
let breathInterval=null, breathTimeout=null;
function startBreathing(){ stopBreathing(); const circle=document.getElementById('breathCircle'); let cycles=0; circle.style.transform='scale(1)'; breathInterval=setInterval(()=>{ circle.style.transform='scale(1.6)'; circle.style.boxShadow='0 22px 48px rgba(52,211,153,0.18)'; setTimeout(()=>{ circle.style.transform='scale(0.9)'; circle.style.boxShadow='0 10px 30px rgba(52,211,153,0.12)'; },2400); cycles++; },3000); timerEl.innerText='60s'; let ttl=60; const timerTick=setInterval(()=>{ ttl--; timerEl.innerText = ttl+'s'; if(ttl<=0){ clearInterval(timerTick);} },1000); breathTimeout=setTimeout(()=>{ stopBreathing(); toast('Breathing complete — +20 pts','success'); points+=20; streak = computeStreak(checkins); saveState(); updateUI(); playSuccess(); },60000); playCalm(); }
function stopBreathing(){ if(breathInterval||breathTimeout){ clearInterval(breathInterval); clearTimeout(breathTimeout); breathInterval=breathTimeout=null; const c=document.getElementById('breathCircle'); if(c) c.style.transform='scale(1)'; timerEl.innerText=''; } }

/* ---- Memory Match (completed) ---- */
let memState = {cards:[],flipped:[],matches:0,canFlip:true};
function setupMemory(){ const symbols=['🍀','🌟','🌙','🔥','💧','🎵','🌈','⚡']; const pool=symbols.concat(symbols).sort(()=>Math.random()-0.5); memState.cards=pool; memState.flipped=[]; memState.matches=0; memState.canFlip=true; const wrap=document.getElementById('memoryCards'); wrap.innerHTML=''; pool.forEach((s,i)=>{ const c=document.createElement('div'); c.className='cardItem'; c.dataset.idx=i; c.innerText=''; c.onclick=()=>flipMem(i); wrap.appendChild(c); }); }
function flipMem(i){ if(!memState.canFlip) return; const wrap=document.getElementById('memoryCards'); const el=wrap.children[i]; if(el.classList.contains('flipped')) return; el.classList.add('flipped'); el.innerText = memState.cards[i]; memState.flipped.push(i); if(memState.flipped.length===2){ memState.canFlip=false; const [a,b]=memState.flipped; if(memState.cards[a]===memState.cards[b]){ memState.matches++; memState.flipped=[]; memState.canFlip=true; if(memState.matches===memState.cards.length/2){ setTimeout(()=>{ toast('Great! Memory cleared +15 pts','success'); points+=15; saveState(); updateUI(); playSuccess(); },300); } } else { setTimeout(()=>{ wrap.children[a].classList.remove('flipped'); wrap.children[a].innerText=''; wrap.children[b].classList.remove('flipped'); wrap.children[b].innerText=''; memState.flipped=[]; memState.canFlip=true; },700); } } }

/* ---- Tap Smash ---- */
let tapInterval=null, tapTimer=null, tapScore=0;
function startTap(){ stopTap(); tapScore=0; const area=document.getElementById('shapesArea'); area.innerHTML=''; let timeLeft=20; timerEl.innerText=`Time: ${timeLeft}s`; tapInterval=setInterval(()=>spawnShape(),700); tapTimer=setInterval(()=>{ timeLeft--; timerEl.innerText=`Time: ${timeLeft}s`; if(timeLeft<=0){ stopTap(); toast(`Finished! Score ${tapScore} (+${Math.max(5,tapScore)} pts)`,'success'); points+=Math.max(5,tapScore); saveState(); updateUI(); playSuccess(); } },1000); }
function spawnShape(){ const area=document.getElementById('shapesArea'); const s=document.createElement('div'); s.className='shape'; const size=36+Math.floor(Math.random()*56); s.style.width=size+'px'; s.style.height=size+'px'; s.style.left = Math.random()*(area.clientWidth - size) + 'px'; s.style.top = Math.random()*(area.clientHeight - size) + 'px'; const colors=['#ef4444','#f97316','#f59e0b','#10b981','#3b82f6']; s.style.background = colors[Math.floor(Math.random()*colors.length)]; s.innerText='Hit'; s.onclick = (e)=>{ e.stopPropagation(); tapScore++; playClick(); s.remove(); }; area.appendChild(s); setTimeout(()=> s.remove(),1600); }
function stopTap(){ if(tapInterval||tapTimer){ clearInterval(tapInterval); clearInterval(tapTimer); tapInterval=tapTimer=null; timerEl.innerText=''; } }

/* ---- Sliding puzzle (3x3) ---- */
let puzzle=[], puzzleSize=3;
function setupPuzzle(){ puzzle = Array.from({length:puzzleSize*puzzleSize},(_,i)=>i); shufflePuzzle(); }
function shufflePuzzle(){ for(let i=puzzle.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [puzzle[i],puzzle[j]]=[puzzle[j],puzzle[i]]; } renderPuzzle(); }
function renderPuzzle(){ const wrap=document.getElementById('puzzleGrid'); wrap.innerHTML=''; puzzle.forEach((v,i)=>{ const d=document.createElement('div'); d.className='puzzleTile'; d.innerText = v===0? '' : v; d.onclick = ()=> moveTile(i); wrap.appendChild(d); }); }
function moveTile(i){ const zero = puzzle.indexOf(0); const zr=Math.floor(zero/puzzleSize), zc=zero%puzzleSize; const ir=Math.floor(i/puzzleSize), ic=i%puzzleSize; const dr=Math.abs(zr-ir), dc=Math.abs(zc-ic); if((dr===1 && dc===0) || (dr===0 && dc===1)){ [puzzle[zero],puzzle[i]]=[puzzle[i],puzzle[zero]]; renderPuzzle(); if(isSolvedPuzzle()){ setTimeout(()=>{ toast('Puzzle solved! +18 pts','success'); points+=18; saveState(); updateUI(); playSuccess(); },250); } } }
function isSolvedPuzzle(){ for(let i=0;i<puzzle.length;i++) if(puzzle[i] !== i) return false; return true; }

/* ---- Zen click ---- */
let zenCount=0;
function zenReset(){ zenCount=0; document.getElementById('zenClicks').innerText=0; document.getElementById('zenBox').style.background='#60a5fa'; }
function zenClick(){ zenCount++; document.getElementById('zenClicks').innerText=zenCount; const colors=['#60a5fa','#34d399','#f97316','#a78bfa','#f472b6']; document.getElementById('zenBox').style.background = colors[zenCount % colors.length]; if(zenCount % 5 === 0){ points+=3; saveState(); updateUI(); toast('Calm clicks +3 pts','success'); playSuccess(); } playClick(); }

/* ---- Stop all games ---- */
function stopAllGames(){ stopBreathing(); stopTap(); }
function stopBreathing(){ if(breathInterval||breathTimeout){ clearInterval(breathInterval); clearTimeout(breathTimeout); breathInterval=breathTimeout=null; const c=document.getElementById('breathCircle'); if(c) c.style.transform='scale(1)'; } }

/* ========== Chatbot (simple offline) ========== */
function sendChat(){ const q=(chatInput.value||'').trim().toLowerCase(); if(!q) return; chatOutput.innerHTML = `<div style="font-weight:700">You:</div><div>${escapeHtml(chatInput.value)}</div>`; let reply = "Thanks for sharing. Try breathing or grounding exercises, and consider talking to someone you trust."; if(q.includes('stress')) reply = "Try 4-7-8 breathing now: inhale 4s, hold 7s, exhale 8s. Short breaks and prioritizing help."; if(q.includes('sad')) reply = "If you're sad, reach out to someone and try a short walk. If it continues, consider professional help."; if(q.includes('anx')) reply = "Grounding (5-4-3-2-1) helps bring focus to the present moment."; if(q.includes('sleep')) reply = "Low screen time before bed and a consistent schedule help. A 20-min nap can restore energy."; chatOutput.innerHTML += `<div style="margin-top:8px;font-weight:700">Bot:</div><div>${reply}</div>`; chatInput.value=''; playClick(); }
function clearChat(){ chatInput.value=''; chatOutput.innerHTML=''; playClick(); }
function escapeHtml(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ========== INIT ========== */
(function init(){ points = Number(localStorage.getItem('mw_points') || points); checkins = JSON.parse(localStorage.getItem('mw_checkins') || JSON.stringify(checkins)); streak = computeStreak(checkins); profile = JSON.parse(localStorage.getItem('mw_profile') || '{}'); document.getElementById('hdrName').innerText = profile.name || 'Guest'; document.getElementById('hdrAvatarImg').src = profile.avatar || ''; document.getElementById('profileAvatarImg').src = profile.avatar || ''; document.getElementById('hdrAvatarImg').onerror = ()=>{ document.getElementById('hdrAvatarImg').src = ''; } // baseline
  document.getElementById('quizArea').style.display='none'; document.getElementById('resultArea').style.display='none'; setupMemory(); setupPuzzle(); zenReset(); saveState(); updateUI(); drawCalendar(); // gentle reminder: daily check-in
  setInterval(()=>{ const today=new Date().toDateString(); if(!checkins.includes(today)){ sendLocalNotification('MindCare — quick check-in','Tap to open and share how you feel today.'); } },1000*60*60*6); // every 6 hours gentle nudges
})();

window.addEventListener('beforeunload', ()=> saveState());

