#!/usr/bin/env node
// Generate one data-entry screen per NERIS module (plus a few non-standard ones) from the
// generated schema. Every screen is self-contained HTML, house-styled, doing event-sourced
// CRUD against the generic records API (/api/v1/records/:module). Re-run after the schema
// regenerates: `node apps/web/scripts/gen-screens.mjs`.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dir, '../../..');
const SCHEMA = resolve(ROOT, 'packages/neris-schema/src/generated/modules.generated.ts');
const FVS_PATH = resolve(ROOT, 'packages/neris-schema/src/generated/field-value-sets.generated.json');
const OUT = resolve(ROOT, 'apps/web/modules');
mkdirSync(OUT, { recursive: true });
// field -> value set map (for dropdowns). Optional: fall back to text inputs if absent.
let FVS = { fieldValueSets: {}, valueSets: {} };
try { FVS = JSON.parse(readFileSync(FVS_PATH, 'utf8')); } catch { /* run the schema generator first for dropdowns */ }

// ------------------------------------------------------------------ parse schema interfaces
function parseInterfaces(text) {
  const out = {};
  const re = /export interface (\w+) \{\n([\s\S]*?)\n\}/g;
  let m;
  while ((m = re.exec(text))) {
    const name = m[1];
    const body = m[2];
    const fields = [];
    let desc = '';
    for (const line of body.split('\n')) {
      const c = line.match(/^\s*\/\*\*\s*(.*?)\s*\*\/\s*$/);
      if (c) { desc = c[1]; continue; }
      const f = line.match(/^\s*([A-Za-z0-9_]+)\??:\s*([^;]+);/);
      if (f) { fields.push({ name: f[1], tsType: f[2].trim(), desc }); desc = ''; }
    }
    out[name] = fields;
  }
  return out;
}

// TS type -> form input kind
function inputKind(tsType) {
  if (tsType === 'number') return 'number';
  if (tsType === 'boolean') return 'checkbox';
  if (/\[\]$/.test(tsType)) return 'array';
  if (tsType === 'string') return 'text';
  return 'json'; // objects (GeoJsonPoint, etc.) or anything exotic
}
function humanize(n) {
  return n.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ------------------------------------------------------------------ screen registry (catalog mapping)
// cat: A incident · B analysis · C CRR · D personnel · E admin · F non-standard
const CATS = {
  A: 'A · Incident documentation',
  B: 'B · Incident analysis',
  C: 'C · Community Risk Reduction',
  D: 'D · Personnel health & safety',
  E: 'E · Department & master data',
  F: 'F · Non-standard (modeled locally)',
};
const REG = {
  // A — incident documentation
  NerisIncidentCore:       { slug: 'incident-core', title: 'Incident record (the run)', cat: 'A', icon: '🚨' },
  NerisCivicLocation:      { slug: 'civic-location', title: 'Location (civic)', cat: 'A', icon: '📍' },
  NerisLocationUse:        { slug: 'location-use', title: 'Location use', cat: 'A', icon: '🏢' },
  NerisFire:               { slug: 'fire', title: 'Fire details', cat: 'A', icon: '🔥' },
  NerisMedical:            { slug: 'medical', title: 'Medical', cat: 'A', icon: '🚑' },
  NerisHazard:             { slug: 'hazard', title: 'Hazardous situation', cat: 'A', icon: '☣️' },
  NerisEmergingHazard:     { slug: 'emerging-hazard', title: 'Emerging hazard', cat: 'A', icon: '⚠️' },
  NerisExposure:           { slug: 'exposure', title: 'Exposures', cat: 'A', icon: '🏚️' },
  NerisRescueFf:           { slug: 'rescue-ff', title: 'Firefighter rescue / casualty', cat: 'A', icon: '🧑‍🚒' },
  NerisRescueNonff:        { slug: 'rescue-nonff', title: 'Civilian rescue / casualty', cat: 'A', icon: '🧑' },
  NerisRiskReduction:      { slug: 'risk-reduction', title: 'Alarms & suppression performance', cat: 'A', icon: '🔔' },
  NerisTacticTimestamps:   { slug: 'tactic-timestamps', title: 'Tactic timestamps', cat: 'A', icon: '⏱️' },
  NerisUnitResponse:       { slug: 'unit-response', title: 'Unit response', cat: 'A', icon: '🚒' },
  NerisDispatch:           { slug: 'dispatch', title: 'Dispatch', cat: 'A', icon: '📟' },
  NerisParcel:             { slug: 'parcel', title: 'Parcel', cat: 'A', icon: '🗺️' },
  NerisWeather:            { slug: 'weather', title: 'Weather', cat: 'A', icon: '🌦️' },
  // B — analysis
  NerisAnalysis:           { slug: 'analysis', title: 'Analysis record', cat: 'B', icon: '🔎' },
  NerisStructureFire:      { slug: 'structure-fire', title: 'Structure fire analysis', cat: 'B', icon: '🏭' },
  NerisOutdoorFire:        { slug: 'outdoor-fire', title: 'Outdoor / wildland fire', cat: 'B', icon: '🌲' },
  NerisTransportationFire: { slug: 'transportation-fire', title: 'Transportation / vehicle fire', cat: 'B', icon: '🚗' },
  NerisBatteryIncident:    { slug: 'battery-incident', title: 'Battery / energy-storage incident', cat: 'B', icon: '🔋' },
  NerisConsumerProducts:   { slug: 'consumer-products', title: 'Consumer product involvement', cat: 'B', icon: '📦' },
  NerisDinsStructure:      { slug: 'dins-structure', title: 'Damage inspection (DINS)', cat: 'B', icon: '🧱' },
  NerisHazsit:             { slug: 'hazsit', title: 'Hazsit analysis', cat: 'B', icon: '⚗️' },
  NerisCasualtyFf:         { slug: 'casualty-ff', title: 'Firefighter casualty analysis', cat: 'B', icon: '🩹' },
  NerisCasualtyNonff:      { slug: 'casualty-nonff', title: 'Civilian casualty analysis', cat: 'B', icon: '🩺' },
  // C — community risk reduction
  NerisCoreCRR:            { slug: 'crr-core', title: 'CRR record (rollup)', cat: 'C', icon: '🤝' },
  NerisHydrantInspection:  { slug: 'hydrant-inspection', title: 'Hydrant inspection / maintenance', cat: 'C', icon: '🚰' },
  NerisCommercialInspection:{ slug: 'commercial-inspection', title: 'Commercial inspection', cat: 'C', icon: '🏬' },
  NerisStructureInspection:{ slug: 'structure-inspection', title: 'Structure inspection', cat: 'C', icon: '🏠' },
  NerisOutdoorInspection:  { slug: 'outdoor-inspection', title: 'Outdoor inspection', cat: 'C', icon: '🌳' },
  NerisHomeVisit:          { slug: 'home-visit', title: 'Home safety visit', cat: 'C', icon: '🏡' },
  NerisCommunityEvent:     { slug: 'community-event', title: 'Community event', cat: 'C', icon: '🎪' },
  NerisParcelDataCollection:{ slug: 'parcel-data-collection', title: 'Parcel data collection', cat: 'C', icon: '📐' },
  // D — personnel health & safety
  NerisHealthSafety:       { slug: 'health-safety', title: 'Health & safety record', cat: 'D', icon: '🦺' },
  NerisIncident:           { slug: 'hs-incident', title: 'Response / exposure event', cat: 'D', icon: '🌡️' },
  NerisPersonnelInjury:    { slug: 'personnel-injury', title: 'Personnel injury', cat: 'D', icon: '🤕' },
  NerisPersonnelSpec:      { slug: 'personnel', title: 'Personnel record', cat: 'D', icon: '🧑‍🚒' },
  // E — admin
  NerisEntityFd:           { slug: 'entity-fd', title: 'Fire department / stations / units', cat: 'E', icon: '🏛️' },
};

// Non-standard screens (not in NERIS) — hand-defined fields.
const EXTRA = [
  { slug: 'scheduling', title: 'Scheduling / staffing', cat: 'F', icon: '📆', fields: [
    { name: 'shift_date', kind: 'text', desc: 'Date of the shift' },
    { name: 'personnel_name', kind: 'text', desc: 'Assigned member' },
    { name: 'station', kind: 'text', desc: 'Station / house' },
    { name: 'apparatus', kind: 'text', desc: 'Assigned apparatus' },
    { name: 'role', kind: 'text', desc: 'Riding position / role' },
    { name: 'start_time', kind: 'text', desc: 'Shift start' },
    { name: 'end_time', kind: 'text', desc: 'Shift end' },
    { name: 'time_off', kind: 'checkbox', desc: 'Time-off / leave' },
    { name: 'notes', kind: 'json', desc: 'Notes' },
  ] },
  { slug: 'training', title: 'Training records', cat: 'F', icon: '🎓', fields: [
    { name: 'personnel_name', kind: 'text', desc: 'Member' },
    { name: 'course', kind: 'text', desc: 'Course / topic' },
    { name: 'date', kind: 'text', desc: 'Date completed' },
    { name: 'hours', kind: 'number', desc: 'Training hours' },
    { name: 'certification', kind: 'text', desc: 'Certification earned' },
    { name: 'iso_credit', kind: 'checkbox', desc: 'Counts toward ISO credit' },
    { name: 'instructor', kind: 'text', desc: 'Instructor' },
    { name: 'notes', kind: 'json', desc: 'Notes' },
  ] },
  { slug: 'apparatus-check', title: 'Apparatus / equipment checks', cat: 'F', icon: '🧰', fields: [
    { name: 'apparatus_id', kind: 'text', desc: 'Apparatus id' },
    { name: 'check_date', kind: 'text', desc: 'Date of check' },
    { name: 'odometer', kind: 'number', desc: 'Odometer / hours' },
    { name: 'fuel_level', kind: 'text', desc: 'Fuel level' },
    { name: 'scba_checked', kind: 'checkbox', desc: 'SCBA checked' },
    { name: 'all_operable', kind: 'checkbox', desc: 'All equipment operable' },
    { name: 'deficiencies', kind: 'json', desc: 'Deficiencies noted' },
    { name: 'checked_by', kind: 'text', desc: 'Checked by' },
  ] },
];

// parent -> child modules (cross-linking): sub-records attach to a parent record.
const CHILDREN = {
  'incident-core': ['civic-location', 'location-use', 'fire', 'medical', 'hazard', 'emerging-hazard', 'exposure',
    'rescue-ff', 'rescue-nonff', 'risk-reduction', 'tactic-timestamps', 'unit-response', 'dispatch', 'parcel', 'weather'],
  'crr-core': ['hydrant-inspection', 'commercial-inspection', 'structure-inspection', 'outdoor-inspection', 'home-visit', 'community-event', 'parcel-data-collection'],
  'analysis': ['structure-fire', 'outdoor-fire', 'transportation-fire', 'battery-incident', 'consumer-products', 'dins-structure', 'hazsit', 'casualty-ff', 'casualty-nonff'],
  'health-safety': ['hs-incident', 'personnel-injury'],
};
const titleBySlug = {};
for (const m of Object.values(REG)) titleBySlug[m.slug] = m.title;
for (const e of EXTRA) titleBySlug[e.slug] = e.title;

// ------------------------------------------------------------------ HTML template
const STYLE = `
  :root{--bg:#0e1116;--panel:#161b22;--panel2:#1c2230;--line:#2a3140;--text:#e6edf3;--muted:#8b98a9;--accent:#4aa3ff;--ok:#3fb950;--warn:#d29922;--bad:#ff3b30;}
  *{box-sizing:border-box;} body{margin:0;font:14px/1.5 ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:var(--bg);color:var(--text);}
  header{display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--panel);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5;}
  header h1{font-size:15px;margin:0;font-weight:600;} header a{color:var(--accent);font-size:12px;text-decoration:none;}
  .spacer{flex:1;} .api{color:var(--muted);font-size:11px;font-family:ui-monospace,monospace;}
  main{display:grid;grid-template-columns:400px 1fr;gap:16px;padding:16px;max-width:1200px;margin:0 auto;}
  @media (max-width:820px){main{grid-template-columns:1fr;}}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:0 0 10px;}
  .card{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:14px;}
  label{display:block;font-size:12px;color:var(--muted);margin:9px 0 3px;}
  input,select,textarea{width:100%;background:#0e131b;border:1px solid var(--line);color:var(--text);border-radius:7px;padding:8px 9px;font:inherit;}
  textarea{min-height:44px;font-family:ui-monospace,monospace;font-size:12px;}
  .check{display:flex;align-items:center;gap:8px;margin-top:10px;} .check input{width:auto;} .check label{margin:0;}
  .desc{font-size:11px;color:#6b7688;margin-top:2px;}
  button{margin-top:14px;width:100%;background:var(--accent);color:#04122b;border:0;border-radius:8px;padding:10px;font-weight:700;cursor:pointer;}
  .msg{margin-top:10px;font-size:13px;min-height:18px;} .msg.ok{color:var(--ok);} .msg.err{color:var(--bad);}
  table{width:100%;border-collapse:collapse;font-size:13px;} th,td{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line);vertical-align:top;}
  th{color:var(--muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.05em;}
  .pill{font-size:10px;padding:1px 7px;border-radius:10px;background:rgba(63,185,80,.14);color:var(--ok);}
  .empty{color:var(--muted);padding:8px 0;} .fields-note{color:#6b7688;font-size:11px;margin-top:12px;}
`;

function fieldControl(f) {
  const label = humanize(f.name);
  const descAttr = f.desc ? ` title="${esc(f.desc)}"` : '';
  const descLine = f.desc ? `<div class="desc">${esc(f.desc)}</div>` : '';
  if (f.kind === 'checkbox') {
    return `      <div class="check"><input type="checkbox" name="${f.name}"${descAttr} /><label>${esc(label)}</label></div>`;
  }
  let control;
  const opts = (f.options || []).map((o) => `<option value="${esc(o)}">${esc(o)}</option>`).join('');
  if (f.kind === 'select') control = `<select name="${f.name}"${descAttr}><option value="">— select —</option>${opts}</select>`;
  else if (f.kind === 'multiselect') control = `<select name="${f.name}" multiple size="4"${descAttr}>${opts}</select>`;
  else if (f.kind === 'number') control = `<input name="${f.name}" type="number" step="any"${descAttr} />`;
  else if (f.kind === 'json') control = `<textarea name="${f.name}"${descAttr} placeholder="text or JSON"></textarea>`;
  else if (f.kind === 'array') control = `<input name="${f.name}"${descAttr} placeholder="comma-separated" />`;
  else control = `<input name="${f.name}"${descAttr} />`;
  const suffix = f.kind === 'multiselect' ? ' <span style="color:#6b7688;font-size:10px;">(ctrl/⌘-click for multiple)</span>' : '';
  return `      <label>${esc(label)}${suffix}</label>\n      ${control}${descLine}`;
}

function screenHtml(mod) {
  const cols = mod.fields.slice(0, 5).map((f) => f.name);
  const fieldsJson = JSON.stringify(mod.fields.map((f) => (f.options ? { n: f.name, k: f.kind, o: f.options } : { n: f.name, k: f.kind })));
  const colsJson = JSON.stringify(cols);
  const childListJson = JSON.stringify((CHILDREN[mod.slug] || []).map((s) => ({ slug: s, title: titleBySlug[s] || s })));
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Open Fire Platform — ${esc(mod.title)}</title>
<style>${STYLE}</style>
</head>
<body>
<header>
  <h1>${mod.icon} ${esc(mod.title)}</h1>
  <a href="../modules.html">← all screens</a>
  <span class="spacer"></span>
  <span class="api" id="apiLabel"></span>
</header>
<div id="parentBanner" style="display:none;padding:8px 16px;background:#12202e;border-bottom:1px solid var(--line);font-size:13px;color:var(--text);"></div>
<main>
  <section class="card">
    <h2>New record</h2>
    <form id="form">
${mod.fields.map(fieldControl).join('\n')}
      <button type="submit" id="submitBtn">Save</button>
      <button type="button" id="cancelBtn" style="display:none;background:#2a3140;color:var(--text);">Cancel edit</button>
      <div class="msg" id="msg"></div>
      <div class="fields-note">module <code>${mod.slug}</code> · ${mod.fields.length} fields · event-sourced CRUD (ADR-0007)</div>
    </form>
  </section>
  <section class="card">
    <h2>Recorded — ${esc(mod.title)}</h2>
    <div class="check" style="margin:0 0 8px;"><input type="checkbox" id="showDeleted" /><label>Show deleted (voided)</label></div>
    <div id="list"><div class="empty">None yet.</div></div>
  </section>
</main>
<script>
(function(){
  var MODULE = ${JSON.stringify(mod.slug)};
  var FIELDS = ${fieldsJson};
  var COLS = ${colsJson};
  var CHILDREN = ${childListJson};
  var params = new URLSearchParams(location.search);
  var lsApi = (function(){ try { return localStorage.getItem('ofp_api'); } catch(e){ return null; } })();
  var API = params.get('api') || lsApi || 'http://localhost:3000/api/v1';
  var apiRaw = params.get('api');
  var API_Q = apiRaw ? '&api=' + encodeURIComponent(apiRaw) : '';
  // Optional auth: send a bearer token when one is present (?token= or localStorage 'ofp_token').
  // Non-breaking in permissive dev; required once the API runs with AUTH_REQUIRED=1.
  var TOKEN = params.get('token') || (function(){ try { return localStorage.getItem('ofp_token'); } catch(e){ return null; } })();
  function afetch(u, o){ o = o || {}; var h = o.headers || {}; if (TOKEN) { h = Object.assign({}, h, { authorization: 'Bearer ' + TOKEN }); } o.headers = h; return fetch(u, o); }
  document.getElementById('apiLabel').textContent = API + '/records/' + MODULE;
  var form = document.getElementById('form'), msg = document.getElementById('msg');
  var submitBtn = document.getElementById('submitBtn'), cancelBtn = document.getElementById('cancelBtn');
  var showDeleted = document.getElementById('showDeleted');
  var records = [], editing = null;

  // parent context (cross-linking): ?parent=<module>:<id>
  var pRaw = params.get('parent'), PARENT = null;
  if (pRaw){ var ix = pRaw.indexOf(':'); if (ix>0) PARENT = { module: pRaw.slice(0,ix), id: pRaw.slice(ix+1) }; }
  if (PARENT){
    var pb = document.getElementById('parentBanner'); pb.style.display='block';
    pb.innerHTML = '↳ attached to <b>'+PARENT.module+'</b> <span style="font-family:ui-monospace,monospace;color:var(--muted);">'+PARENT.id+'</span> · '+
      '<a href="'+PARENT.module+'.html?'+(apiRaw?('api='+encodeURIComponent(apiRaw)):'')+'" style="color:var(--accent);text-decoration:none;">open parent →</a>';
  }

  function serialize(){
    var data = {};
    FIELDS.forEach(function(f){
      var elx = form.elements[f.n]; if(!elx) return;
      if (f.k==='checkbox'){ data[f.n] = elx.checked; return; }
      if (f.k==='multiselect'){ var sel=Array.prototype.map.call(elx.selectedOptions,function(o){return o.value;}).filter(Boolean); if(sel.length) data[f.n]=sel; return; }
      var v = elx.value;
      if (v==='' || v==null) return;
      if (f.k==='number'){ var num=Number(v); if(!isNaN(num)) data[f.n]=num; }
      else if (f.k==='array'){ var a=v.split(',').map(function(s){return s.trim();}).filter(Boolean); if(a.length) data[f.n]=a; }
      else if (f.k==='json'){ try{ data[f.n]=JSON.parse(v); }catch(e){ data[f.n]=v; } }
      else data[f.n]=v; // text + select
    });
    return data;
  }
  function fill(rec){
    var d = rec.data || {};
    FIELDS.forEach(function(f){
      var elx = form.elements[f.n]; if(!elx) return;
      var v = d[f.n];
      if (f.k==='checkbox'){ elx.checked = !!v; }
      else if (f.k==='multiselect'){ var arr=Array.isArray(v)?v:(v==null?[]:[v]); Array.prototype.forEach.call(elx.options,function(o){o.selected=arr.indexOf(o.value)>=0;}); }
      else if (f.k==='array'){ elx.value = Array.isArray(v)? v.join(', ') : (v==null?'':v); }
      else if (f.k==='json'){ elx.value = (v==null)?'':(typeof v==='object'? JSON.stringify(v) : String(v)); }
      else { elx.value = (v==null)?'':v; } // text + select
    });
  }
  function resetForm(){ form.reset(); editing=null; submitBtn.textContent='Save'; cancelBtn.style.display='none'; }
  cancelBtn.addEventListener('click', resetForm);

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var data = serialize(), url, method;
    if (editing){ url = API+'/records/'+MODULE+'/'+editing.id+'?expectedVersion='+editing.version; method='PATCH'; }
    else { url = API+'/records/'+MODULE+(PARENT?('?parentModule='+encodeURIComponent(PARENT.module)+'&parentId='+encodeURIComponent(PARENT.id)):''); method='POST'; }
    afetch(url,{method:method,headers:{'content-type':'application/json'},body:JSON.stringify(data)})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status+(r.status===409?' (someone else edited this — reload)':'')); return r.json(); })
      .then(function(){ msg.className='msg ok'; msg.textContent = editing?'Updated.':'Saved.'; resetForm(); load(); })
      .catch(function(err){ msg.className='msg err'; msg.textContent=(editing?'Update':'Save')+' failed: '+err.message; });
  });

  function startEdit(id){ var rec = records.find(function(r){return r.id===id;}); if(!rec) return;
    fill(rec); editing={id:id,version:rec.version}; submitBtn.textContent='Update (v'+rec.version+')'; cancelBtn.style.display='block';
    msg.className='msg'; msg.textContent=''; window.scrollTo(0,0);
  }
  function del(id){ var rec = records.find(function(r){return r.id===id;}); if(!rec) return;
    if(!confirm('Delete this record? (history is kept in the log)')) return;
    afetch(API+'/records/'+MODULE+'/'+id+'?expectedVersion='+rec.version,{method:'DELETE'})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(){ msg.className='msg ok'; msg.textContent='Deleted.'; if(editing&&editing.id===id) resetForm(); load(); })
      .catch(function(err){ msg.className='msg err'; msg.textContent='Delete failed: '+err.message; });
  }
  function showHistory(id){
    afetch(API+'/records/'+MODULE+'/'+id+'/history').then(function(r){return r.json();}).then(function(h){
      var lines=(h||[]).map(function(e){ return '#'+e.seq+'  '+e.type+'  '+(e.at||''); }).join('\\n');
      alert('History for '+id+':\\n\\n'+lines);
    }).catch(function(){});
  }
  function cell(rec,name){ var v=(rec.data||{})[name];
    if(v==null) return '—'; if(v===true) return '✓'; if(v===false) return '—';
    if(Array.isArray(v)) return v.join(', '); if(typeof v==='object') return JSON.stringify(v); return String(v);
  }
  function toggleRelated(a){
    var tr = a.closest('tr'), nx = tr.nextSibling;
    if (nx && nx.className==='relrow'){ nx.parentNode.removeChild(nx); return; }
    var id = a.getAttribute('data-rel');
    var links = CHILDREN.map(function(c){ return '<a href="'+c.slug+'.html?parent='+MODULE+':'+id+API_Q+'" style="color:var(--accent);margin:0 12px 4px 0;white-space:nowrap;display:inline-block;">＋ '+c.title+'</a>'; }).join('');
    var row = document.createElement('tr'); row.className='relrow';
    row.innerHTML = '<td colspan="'+(COLS.length+1)+'" style="background:#0e131b;"><div style="padding:6px 2px;color:var(--muted);font-size:12px;">Attach a sub-record → '+links+'</div></td>';
    tr.parentNode.insertBefore(row, tr.nextSibling);
  }
  function load(){
    var q = []; if (showDeleted.checked) q.push('includeDeleted=1'); if (PARENT) q.push('parentId='+encodeURIComponent(PARENT.id));
    var url = API+'/records/'+MODULE+(q.length?('?'+q.join('&')):'');
    afetch(url).then(function(r){return r.json();}).then(function(list){
      var all = list||[]; records = all.filter(function(r){return !r.deleted;});
      var box=document.getElementById('list');
      if(!all.length){ box.innerHTML='<div class="empty">None yet.</div>'; return; }
      var head = COLS.map(function(c){ return '<th>'+c.replace(/[_-]+/g,' ')+'</th>'; }).join('')+'<th></th>';
      var rows = all.map(function(rec){
        if(rec.deleted){ return '<tr style="opacity:.5;"><td colspan="'+(COLS.length)+'"><span class="pill" style="background:rgba(255,59,48,.14);color:var(--bad);">deleted</span> '+(rec.deletedReason||'voided')+'</td>'+
          '<td><a href="#" data-hist="'+rec.id+'" style="color:var(--muted);">history</a></td></tr>'; }
        var tds = COLS.map(function(c){ return '<td>'+cell(rec,c)+'</td>'; }).join('');
        var rel = CHILDREN.length ? ' · <a href="#" data-rel="'+rec.id+'" style="color:var(--ok);">related ▾</a>' : '';
        return '<tr>'+tds+'<td style="white-space:nowrap;"><a href="#" data-edit="'+rec.id+'" style="color:var(--accent);">edit</a> · '+
          '<a href="#" data-hist="'+rec.id+'" style="color:var(--muted);">hist</a> · '+
          '<a href="#" data-del="'+rec.id+'" style="color:var(--bad);">del</a>'+rel+'</td></tr>';
      }).join('');
      box.innerHTML='<table><thead><tr>'+head+'</tr></thead><tbody>'+rows+'</tbody></table>';
      box.querySelectorAll('[data-edit]').forEach(function(a){a.onclick=function(e){e.preventDefault();startEdit(a.getAttribute('data-edit'));};});
      box.querySelectorAll('[data-del]').forEach(function(a){a.onclick=function(e){e.preventDefault();del(a.getAttribute('data-del'));};});
      box.querySelectorAll('[data-hist]').forEach(function(a){a.onclick=function(e){e.preventDefault();showHistory(a.getAttribute('data-hist'));};});
      box.querySelectorAll('[data-rel]').forEach(function(a){a.onclick=function(e){e.preventDefault();toggleRelated(a);};});
    }).catch(function(){ document.getElementById('list').innerHTML='<div class="empty">API offline — start the server or pass ?api=…</div>'; });
  }
  showDeleted.addEventListener('change', load);
  load();
})();
</script>
</body>
</html>
`;
}

function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

// ------------------------------------------------------------------ build
const schemaText = readFileSync(SCHEMA, 'utf8');
const ifaces = parseInterfaces(schemaText);
const screens = [];

for (const [iface, meta] of Object.entries(REG)) {
  const raw = ifaces[iface];
  if (!raw) { console.warn('!! interface not found in schema:', iface); continue; }
  const vsMap = FVS.fieldValueSets[iface] || {};
  const fields = raw.map((f) => {
    const vsName = vsMap[f.name];
    const options = vsName ? FVS.valueSets[vsName] : null;
    if (options && options.length) {
      return { name: f.name, kind: /\[\]$/.test(f.tsType) ? 'multiselect' : 'select', desc: f.desc, options };
    }
    return { name: f.name, kind: inputKind(f.tsType), desc: f.desc };
  });
  const mod = { ...meta, iface, fields };
  writeFileSync(resolve(OUT, meta.slug + '.html'), screenHtml(mod));
  screens.push(mod);
}
for (const ex of EXTRA) {
  writeFileSync(resolve(OUT, ex.slug + '.html'), screenHtml(ex));
  screens.push(ex);
}

// index page
const byCat = {};
screens.forEach((s) => { (byCat[s.cat] = byCat[s.cat] || []).push(s); });
const indexHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Open Fire Platform — Module Screens</title>
<style>${STYLE}
  .wrap{max-width:1000px;margin:0 auto;padding:18px;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px;margin:8px 0 22px;}
  .tile{display:flex;align-items:center;gap:10px;background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:11px 12px;text-decoration:none;color:var(--text);}
  .tile:hover{border-color:var(--accent);} .tile .ic{font-size:20px;} .tile .t{font-size:13px;font-weight:600;} .tile .s{font-size:11px;color:var(--muted);font-family:ui-monospace,monospace;}
  .cat{font-size:12px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);margin:18px 0 2px;}
  .lead{color:var(--muted);font-size:13px;max-width:70ch;}
</style>
</head>
<body>
<header>
  <h1>🗂️ Module screens</h1>
  <a href="index.html">← live incident view</a>
  <a href="command.html" style="margin-left:10px;">command board →</a>
  <span class="spacer"></span>
  <span class="api">${screens.length} screens</span>
</header>
<div style="padding:8px 18px;background:var(--panel);border-bottom:1px solid var(--line);font-size:12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
  <span style="color:var(--muted);">🔑 Auth</span>
  <span id="authState" style="color:var(--muted);">checking…</span>
  <a href="login.html" style="color:var(--accent);text-decoration:none;">Sign in ↗</a>
  <span class="spacer" style="flex:1;"></span>
  <input id="apiBase" placeholder="http://localhost:3000/api/v1" style="width:260px;background:#0e131b;border:1px solid var(--line);color:var(--text);border-radius:6px;padding:5px 8px;font:inherit;font-size:12px;" />
  <select id="mintRole" style="background:#0e131b;border:1px solid var(--line);color:var(--text);border-radius:6px;padding:5px;font-size:12px;"><option value="responder,officer">responder+officer</option><option value="responder">responder</option><option value="officer">officer</option><option value="admin">admin</option></select>
  <input id="mintDept" placeholder="DEPT_A" value="DEMO_DEPT" style="width:110px;background:#0e131b;border:1px solid var(--line);color:var(--text);border-radius:6px;padding:5px 8px;font:inherit;font-size:12px;" />
  <button id="mintBtn" style="width:auto;margin:0;padding:6px 12px;">Mint dev token</button>
  <button id="clearTok" style="width:auto;margin:0;padding:6px 12px;background:#2a3140;color:var(--text);">Clear</button>
</div>
<div class="wrap">
  <p class="lead">Every NERIS module (plus a few locally-modeled screens) as a data-entry form.
  All generated from the schema and backed by one event-sourced records API
  (<code>/api/v1/records/:module</code>) — edits append events, deletes are discoverable
  tombstones, every record has a full audit trail (ADR-0005 / ADR-0007).</p>
${Object.keys(CATS).filter((c)=>byCat[c]).map((c)=>`  <div class="cat">${esc(CATS[c])}</div>
  <div class="grid">
${byCat[c].map((s)=>`    <a class="tile" href="modules/${s.slug}.html"><span class="ic">${s.icon}</span><span><div class="t">${esc(s.title)}</div><div class="s">${s.slug}</div></span></a>`).join('\n')}
  </div>`).join('\n')}
</div>
<script>
(function(){
  function ls(k,v){ try { return v===undefined ? localStorage.getItem(k) : localStorage.setItem(k,v); } catch(e){ return null; } }
  function del(k){ try { localStorage.removeItem(k); } catch(e){} }
  var api = document.getElementById('apiBase');
  api.value = ls('ofp_api') || 'http://localhost:3000/api/v1';
  api.addEventListener('change', function(){ ls('ofp_api', api.value); });
  function refresh(){
    var t = ls('ofp_token');
    var el = document.getElementById('authState');
    if (!t){ el.innerHTML = 'no token — screens use the API\\'s permissive dev mode'; el.style.color='var(--muted)'; return; }
    try { var p = JSON.parse(atob(t.split('.')[1])); el.innerHTML = 'token: <b style="color:var(--text)">'+p.dept+'</b> · roles ['+(p.roles||[]).join(', ')+']'; el.style.color='var(--ok)'; }
    catch(e){ el.textContent='token set'; }
  }
  document.getElementById('mintBtn').onclick = function(){
    var base = api.value.replace(/\\/$/,'');
    fetch(base+'/auth/dev-token',{method:'POST',headers:{'content-type':'application/json'},
      body:JSON.stringify({ departmentId: document.getElementById('mintDept').value||'DEMO_DEPT', roles: document.getElementById('mintRole').value.split(',') })})
      .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status+' (dev tokens disabled?)'); return r.json(); })
      .then(function(j){ ls('ofp_token', j.token); refresh(); })
      .catch(function(e){ document.getElementById('authState').textContent = 'mint failed: '+e.message; });
  };
  document.getElementById('clearTok').onclick = function(){ del('ofp_token'); refresh(); };
  refresh();
})();
</script>
</body>
</html>
`;
writeFileSync(resolve(ROOT, 'apps/web/modules.html'), indexHtml);

console.log('Generated ' + screens.length + ' screens into apps/web/modules/ + modules.html');
console.log('By category: ' + Object.keys(byCat).map((c)=>c+':'+byCat[c].length).join('  '));
