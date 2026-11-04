/* أدوات مشتركة بين صفحة العرض وصفحة الإدارة */

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function thumbUrl(id, w) { return 'https://drive.google.com/thumbnail?id=' + id + '&sz=w' + (w || 600); }
function previewUrl(id) { return 'https://drive.google.com/file/d/' + id + '/preview'; }
function viewUrl(id) { return 'https://drive.google.com/file/d/' + id + '/view'; }

function parseD(s) {
  if (!s) return null;
  var p = String(s).slice(0, 10).split('-').map(Number);
  if (!p[0]) return null;
  return new Date(p[0], (p[1] || 1) - 1, p[2] || 1);
}

function isoToday() {
  var d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

var _fG, _fH;
try {
  _fG = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });
  _fH = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' });
} catch (e) { _fG = null; _fH = null; }

function dateText(s) {
  var d = parseD(s);
  if (!d) return '';
  if (!_fG) return String(s);
  return _fG.format(d) + ' (' + _fH.format(d) + ')';
}

function semLabel(id) {
  var s = CONFIG.semesters.find(function (x) { return x.id === id; });
  return s ? s.label : '';
}

function semFromDate(s) {
  var d = parseD(s);
  return d ? CONFIG.semFromDate(d) : '';
}

/* يحوّل الأرقام العربية إلى رقم */
function toNum(v) {
  if (v === '' || v == null) return NaN;
  var s = String(v).replace(/[٠-٩]/g, function (c) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(c); }).replace(/[^\d.]/g, '');
  return s ? Number(s) : NaN;
}

function progressOf(report) {
  var t = toNum(report && report.target), a = toNum(report && report.achieved);
  if (!(t > 0) || isNaN(a)) return null;
  return { target: t, achieved: a, pct: Math.round(a / t * 100) };
}

/* تجميع الملفات ذات العنوان والتاريخ والإجراء نفسه في شاهد واحد */
function groupFiles(files) {
  var map = new Map();
  files.forEach(function (f) {
    var k = [f.title, f.date, f.actionId, f.sub, f.sem].join('|');
    if (!map.has(k)) map.set(k, { title: f.title, date: f.date, sub: f.sub, sem: f.sem, actionId: f.actionId, files: [] });
    map.get(k).files.push(f);
  });
  return Array.from(map.values());
}

/* ترتيب المجلدات الفرعية بتسلسل منطقي: الخطة ثم الاستبانات ثم الأثر ثم الآراء ثم التكريم */
function subRank(name) {
  var order = ['خطة', 'استبان', 'أثر', 'آراء', 'تكريم'];
  for (var i = 0; i < order.length; i++) if (name.indexOf(order[i]) !== -1) return i;
  return order.length;
}

async function apiGet() {
  var r = await fetch(CONFIG.API_URL + '?action=data');
  var j = await r.json();
  if (!j.ok) throw new Error(j.error || 'تعذّر تحميل البيانات');
  return j.data;
}

async function apiPost(body) {
  var r = await fetch(CONFIG.API_URL, { method: 'POST', body: JSON.stringify(body) });
  var j = await r.json();
  if (!j.ok) throw new Error(j.error || 'تعذّر تنفيذ الطلب');
  return j;
}

var ICONS = {
  pdf: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/></svg>',
  img: '<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 8"/></svg>',
  back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  close: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12"/><path d="M18 6L6 18"/></svg>',
  prev: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>',
  next: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>',
  download: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="M7 10l5 5 5-5"/><path d="M5 21h14"/></svg>'
};
