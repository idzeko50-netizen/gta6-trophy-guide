// GTA 6 trophy guide: checklist, filters, spoiler mode, roadmap and progress.
// Everything runs offline. Ticks live in localStorage; export/import move them as a file.
// URL params are only for screenshots and deep links and never write to storage:
//   ?demo=1 ticks a few trophies in memory, ?view=roadmap opens the roadmap,
//   ?open=<id> expands one trophy's guide, ?kind=story&spoilers=on presets the filters.

const STORE_KEY = 'gta6-trophy-guide-v1';
const params = new URLSearchParams(location.search);
const DEMO_IDS = [2, 3, 8, 15, 17, 20, 28, 30, 35, 40, 52, 54];

const listEl = document.getElementById('list');
const roadmapEl = document.getElementById('roadmap');
const earnedCountEl = document.getElementById('earnedCount');
const barFillEl = document.getElementById('barFill');
const gradeCountsEl = document.getElementById('gradeCounts');
const platLineEl = document.getElementById('platLine');
const resultCountEl = document.getElementById('resultCount');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kindFilter');
const gradeEl = document.getElementById('gradeFilter');
const spoilerEl = document.getElementById('spoilerToggle');
const earnedOnlyEl = document.getElementById('earnedOnly');

let trophies = [];
let earned = new Set();
let spoilersHidden = false;
let openId = null;
let onlyId = null; // deep link to one trophy's guide (?only=<id>)

try {
  earned = new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? '[]'));
} catch {
  earned = new Set();
}
if (params.get('demo') === '1') {
  for (const id of DEMO_IDS) earned.add(id); // demo ticks, in memory only
}

function save() {
  if (params.get('demo') === '1') return; // demo mode must not pollute real progress
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
  } catch { /* private mode: ticks still work for this session */ }
}

const GRADE_LABEL = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };
const KIND_LABEL = { story: 'Story', missable: 'Missable', collectible: 'Collectible', activity: 'Activity', online: 'Online' };

function esc(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function isHiddenFromSpoilers(t) {
  return spoilersHidden && t.kind === 'story' && !earned.has(t.id);
}

function renderProgress() {
  const total = trophies.length;
  const done = trophies.filter((t) => earned.has(t.id)).length;
  earnedCountEl.textContent = String(done);
  barFillEl.style.width = total ? `${Math.round((done / total) * 100)}%` : '0%';
  gradeCountsEl.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => {
      const n = trophies.filter((t) => t.grade === g && earned.has(t.id)).length;
      const all = trophies.filter((t) => t.grade === g).length;
      return `${GRADE_LABEL[g]} ${n}/${all}`;
    })
    .join('  ·  ');
  const others = done - (earned.has(1) ? 1 : 0);
  platLineEl.textContent = earned.has(1)
    ? 'Platinum earned — Vice Got a Price!'
    : `Platinum: Vice Got a Price! — ${others} of 54 other trophies earned`;
}

function trophyCard(t) {
  const li = document.createElement('li');
  li.className = 'card' + (earned.has(t.id) ? ' earned' : '') + (t.missable ? ' missable' : '');
  li.id = `trophy-${t.id}`;
  const hidden = isHiddenFromSpoilers(t);
  const name = hidden ? 'Hidden trophy' : t.name;
  const desc = hidden ? 'Story trophy — its name and description stay hidden until you earn it.' : t.description;
  const open = openId === t.id;
  li.innerHTML = `
    <label class="row">
      <input type="checkbox" data-id="${t.id}" ${earned.has(t.id) ? 'checked' : ''} aria-label="Mark ${esc(t.name)} earned">
      <span class="main">
        <span class="name">${esc(name)}</span>
        <span class="badges">
          <span class="badge grade-${t.grade}">${GRADE_LABEL[t.grade]}</span>
          ${t.missable ? '<span class="badge miss">MISSABLE</span>' : `<span class="badge kind">${KIND_LABEL[t.kind] ?? t.kind}</span>`}
          ${t.hidden ? '<span class="badge hid">Hidden on PS5</span>' : ''}
          <span class="badge stage">Roadmap ${t.roadmap_stage}</span>
        </span>
        <span class="desc">${esc(desc)}</span>
      </span>
    </label>
    <button type="button" class="guideBtn" data-id="${t.id}" aria-expanded="${open}">${open ? 'Hide guide' : 'Show guide'}</button>
    ${open ? `<div class="guide">
      <p>${esc(t.guide)}</p>
      <p class="sources">Sources: ${t.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.name)}</a>`).join(' · ')}</p>
    </div>` : ''}`;
  return li;
}

function renderList() {
  const q = searchEl.value.trim().toLowerCase();
  const kind = kindEl.value;
  const grade = gradeEl.value;
  const only = earnedOnlyEl.checked;
  const shown = trophies.filter((t) => {
    if (onlyId && t.id !== onlyId) return false;
    if (only && !earned.has(t.id)) return false;
    if (kind !== 'all' && t.kind !== kind) return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
  listEl.replaceChildren(...shown.map(trophyCard));
  resultCountEl.textContent = shown.length === trophies.length
    ? `${trophies.length} trophies`
    : `${shown.length} of ${trophies.length} trophies match`;
  renderProgress();
}

const STAGES = [
  { n: 1, title: 'Play the story — and do the one missable thing', body: 'Chapters 1–4 and the final mission. The 12 story trophies pop as you go. During Chapter 1, after the mission Down to Earth, meditate with Lucia on the balcony at Jason\u2019s house — it may be the only chance (Positive Mental Attitude). Keep a manual save at the start and end of each chapter: there is no mission replay.' },
  { n: 2, title: 'Side stories & strangers', body: 'Finish the mission strands for Andy, Kenton, Billy, Randy and Tyrone, hunt a unique animal for Bret, and complete 8 Strangers & Freaks strands (purple icons on the map). Do these as they appear — there are more strands than the 8 you need.' },
  { n: 3, title: 'Activities & skills', body: 'Gold all 42 Shooting Range challenges, win Top Fun drone races at all 14 locations, win 20 different races, beat Cal\u2019s fishing challenge, finish an arcade game, try all 9 activity types, and bank 250 stunts (300 are needed for 100%).' },
  { n: 4, title: 'Collectibles & exploration', body: 'Complete 3 card sets (15 for 100%), WAiNK It at 100 locations, discover 100 vehicles, explore all of Leonida, and buy all 8 garages ($160,000 total) so you can register 10 vehicles with Scooter Bros.' },
  { n: 5, title: 'Crime, money & the long grinds — then the platinum', body: 'Rob 5 bank vaults, an armored truck and a jewelry store unseen, hit one illegal operation per gang, launder $250,000 in Marked Bills, spend $100,000, finish 50 Challenges (70 for 100%) and 500 Criminal Profile actions. Then A Long Road (100% completion) and, last of all, Vice Got a Price! — the platinum.' },
];

function renderRoadmap() {
  roadmapEl.replaceChildren(...STAGES.map((s) => {
    const li = document.createElement('li');
    li.className = 'stage';
    const items = trophies.filter((t) => t.roadmap_stage === s.n);
    const done = items.filter((t) => earned.has(t.id)).length;
    li.innerHTML = `
      <h3>Stage ${s.n} — ${esc(s.title)} <span class="stageCount">${done}/${items.length} earned</span></h3>
      <p>${esc(s.body)}</p>
      <p class="stageTrophies">${items.map((t) => `<a href="#trophy-${t.id}" data-goto="${t.id}">${esc(t.name)}</a>`).join(' · ')}</p>`;
    return li;
  }));
}

function showView(view) {
  const roadmap = view === 'roadmap';
  document.getElementById('roadmapView').hidden = !roadmap;
  document.getElementById('checklistView').hidden = roadmap;
  document.getElementById('controls').style.display = roadmap ? 'none' : '';
  document.getElementById('missableWarn').style.display = roadmap ? 'none' : '';
  document.getElementById('tabRoadmap').classList.toggle('active', roadmap);
  document.getElementById('tabChecklist').classList.toggle('active', !roadmap);
  document.getElementById('tabRoadmap').setAttribute('aria-selected', String(roadmap));
  document.getElementById('tabChecklist').setAttribute('aria-selected', String(!roadmap));
  if (roadmap) renderRoadmap();
}

listEl.addEventListener('change', (e) => {
  const box = e.target.closest('input[type="checkbox"][data-id]');
  if (!box) return;
  const id = Number(box.dataset.id);
  if (box.checked) earned.add(id); else earned.delete(id);
  save();
  box.closest('.card').classList.toggle('earned', box.checked);
  renderProgress();
});

listEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.guideBtn');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  openId = openId === id ? null : id;
  renderList();
  const card = document.getElementById(`trophy-${id}`);
  if (card && openId === id) card.scrollIntoView({ block: 'nearest' });
});

roadmapEl.addEventListener('click', (e) => {
  const link = e.target.closest('a[data-goto]');
  if (!link) return;
  e.preventDefault();
  openId = Number(link.dataset.goto);
  showView('checklist');
  renderList();
  document.getElementById(`trophy-${openId}`)?.scrollIntoView({ block: 'center' });
});

searchEl.addEventListener('input', renderList);
kindEl.addEventListener('change', renderList);
gradeEl.addEventListener('change', renderList);
earnedOnlyEl.addEventListener('change', renderList);
spoilerEl.addEventListener('change', () => { spoilersHidden = spoilerEl.checked; renderList(); });
document.getElementById('tabChecklist').addEventListener('click', () => showView('checklist'));
document.getElementById('tabRoadmap').addEventListener('click', () => showView('roadmap'));

document.getElementById('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data) ? data : data.earned;
    const valid = new Set(trophies.map((t) => t.id));
    earned = new Set(ids.filter((id) => valid.has(Number(id))).map(Number));
    save();
    renderList();
  } catch {
    alert('That file could not be read as a progress export.');
  }
  e.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (!confirm('Clear all earned ticks?')) return;
  earned.clear();
  save();
  renderList();
});

// Deep-link presets (screenshots and shared links).
if (params.get('kind')) kindEl.value = params.get('kind');
if (params.get('grade')) gradeEl.value = params.get('grade');
if (params.get('spoilers') === 'on') { spoilerEl.checked = true; spoilersHidden = true; }
if (params.get('open')) openId = Number(params.get('open'));
if (params.get('only')) onlyId = Number(params.get('only'));

const res = await fetch('data/trophies.json');
trophies = (await res.json()).trophies;
if (onlyId) document.getElementById('missableWarn').style.display = 'none'; // focused single-trophy view
renderList();
if (params.get('view') === 'roadmap') {
  showView('roadmap');
}
// No scrollIntoView on load: headless screenshots of a scrolled page can leave
// unpainted bands, and with ?only=<id> the card is already in view.
