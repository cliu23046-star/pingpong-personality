import { useState, useRef, useEffect, useCallback } from "react";

var DIMENSIONS = [
  { key: 'attack', name: '攻防倾向', icon: '⚔️', low: '防守型', high: '进攻型', desc: '你在比赛中的进攻/防守偏好' },
  { key: 'flexibility', name: '战术弹性', icon: '🔄', low: '体系执行', high: '灵活多变', desc: '面对变化时的调整能力' },
  { key: 'pressure', name: '压力应对', icon: '🧠', low: '压力敏感', high: '大心脏', desc: '关键时刻的心理素质' },
  { key: 'rhythm', name: '节奏控制', icon: '⏱️', low: '慢节奏控制', high: '快节奏抢攻', desc: '你偏好的比赛节奏' },
  { key: 'serve', name: '发球策略', icon: '🎯', low: '稳健保守', high: '变化多端', desc: '发球的主动性和变化性' },
  { key: 'receive', name: '接发球策略', icon: '🛡️', low: '保守过渡', high: '积极抢攻', desc: '接发球时的主动性' },
  { key: 'hand', name: '正反手偏好', icon: '✋', low: '反手主导', high: '正手主导', desc: '比赛中正反手的使用偏好' },
];

var QUESTIONS = [
  // === 攻防倾向 ===
  { dim: 'attack', text: '比分来到9:9，你发球后对手回了一个半高球，你会：',
    options: ['轻拉一板到对手反手位，先稳住', '中等力量拉到对手空档', '直接发力冲，争取一板解决'] },
  { dim: 'attack', text: '对手防守很好，你连续拉了三板都没得分，你会：',
    options: ['改为控制落点，和对手慢慢磨', '继续进攻但改变线路和节奏', '加大力量，用更大的力量突破'] },
  { dim: 'attack', text: '相持中双方已经拉了五六板，你心里想的是：',
    options: ['安全回球保证不失误', '找机会变线或加速打空档', '必须结束了，找机会发力冲死'] },
  { dim: 'attack', text: '你领先7:4，对手开始拼命进攻，你会：',
    options: ['稳住节奏，防守为主，等对手失误', '有机会就反击，没机会就防守', '主动对攻，不给对手节奏'] },
  { dim: 'attack', text: '描述你平时赢球的主要方式：',
    options: ['对手失误和我的稳定性', '主动进攻和对手失误各占一半', '绝大多数靠我主动进攻得分'] },
  { dim: 'attack', text: '如果用一个词形容你的打法风格：',
    options: ['稳健，让对手犯错', '攻守兼备，伺机而动', '冶炼进攻，压制对手'] },

  // === 战术弹性 ===
  { dim: 'flexibility', text: '对手是你没见过的长胶打法，开局连丢三分，你会：',
    options: ['坚持自己的打法，相信适应后会好', '尝试调整一两个战术细节', '完全改变打法，试不同的套路'] },
  { dim: 'flexibility', text: '你发现对手反手位明显弱，但你自己最擅长正手对拉时，你会：',
    options: ['继续打我最擅长的线路', '主要攻弱点，偶尔变化', '立刻改变策略，专攻弱点'] },
  { dim: 'flexibility', text: '比赛中你已经用同一套发球战术赢了前两局，第三局对手适应了，你会：',
    options: ['继续用，相信执行质量更重要', '微调落点和旋转变化', '完全换一套新的发球组合'] },
  { dim: 'flexibility', text: '暂停时教练/队友给你建议改变打法，你会：',
    options: ['听但还是按自己习惯打', '尝试融入部分建议', '积极采纳，马上调整'] },
  { dim: 'flexibility', text: '你更认同哪种训练理念？',
    options: ['把一招练到极致比什么都重要', '有核心技术，也要有备用方案', '会的越多越好，能应对各种对手'] },

  // === 压力应对 ===
  { dim: 'pressure', text: '决胜局9:9，你发球，你心里的状态是：',
    options: ['心跳加速，手有点紧，希望快点结束', '有点紧张但能控制，按计划打', '兴奋，这就是我的舒适区'] },
  { dim: 'pressure', text: '比赛时旁边站了很多观众，你的反应是：',
    options: ['明显紧张，发挥不出平时水平', '有点影响但基本能正常发挥', '喜欢被关注的感觉，越打越兴奋'] },
  { dim: 'pressure', text: '局分0:2落后，你的心态是：',
    options: ['基本放弃了，尽力打完', '还有机会，一局一局来', '太好了，最喜欢逆风局，放开打'] },
  { dim: 'pressure', text: '裁判明显误判了一个擦边球，你丢了关键一分，你会：',
    options: ['很难平复，接下来几个球都受影响', '有点郁闷但能强迫自己专注', '快速翻篇，下一分就忘了'] },
  { dim: 'pressure', text: '你在大比分2:1领先第四局被对手连追5分，从7:3领先变成7:8，你会：',
    options: ['开始怀疑自己，动作越来越保守', '叫暂停调整，重新组织', '告诉自己忘掉比分，专注打好每一分'] },

  // === 节奏控制 ===
  { dim: 'rhythm', text: '你发球前的习惯是：',
    options: ['慢慢准备，想好战术再发', '正常节奏，不快不慢', '拿到球就发，保持节奏连贯'] },
  { dim: 'rhythm', text: '对手慢悠悠擦汗、系鞋带，打断了你的节奏，你会：',
    options: ['无所谓，我也休息一下调整思路', '有点不爽但能调整', '很急躁，希望快点继续'] },
  { dim: 'rhythm', text: '你更享受哪种回合？',
    options: ['多拍相持，双方轮番攻防的拉锯战', '都可以，看情况', '前三板解决战斗，干净利落'] },
  { dim: 'rhythm', text: '你连赢三分后，你会：',
    options: ['放慢节奏，稳住优势', '保持现有节奏', '加快节奏，乘胜追击'] },
  { dim: 'rhythm', text: '如果用"慢→快"的尺度衡量你的打法：',
    options: ['偏慢，我喜欢掌控节奏', '中等，快慢都行', '偏快，慢下来反而不舒服'] },

  // === 发球策略 ===
  { dim: 'serve', text: '关键分你发球时会：',
    options: ['用最有把握的发球，确保不失误', '用练得最好的发球，但加点变化', '反而发对手没见过的发球，出其不意'] },
  { dim: 'serve', text: '你平时练发球的方式是：',
    options: ['反复练两三种最常用的，追求稳定', '练四五种，有主有次', '各种发球都练，喜欢研究新发球'] },
  { dim: 'serve', text: '对手连续两个接发球抢攻得分时，你会：',
    options: ['换一种更安全的发球', '改变落点或旋转', '完全换一套发球组合和第三板套路'] },
  { dim: 'serve', text: '你的发球种类大概有：',
    options: ['2-3种常用发球', '4-5种，有明确的组合套路', '6种以上，并且都会在比赛中使用'] },
  { dim: 'serve', text: '你觉得发球最重要的是：',
    options: ['不失误，先把球发上台', '配合第三板套路', '直接通过发球创造机会或得分'] },

  // === 接发球策略 ===
  { dim: 'receive', text: '对手发了一个你看不清旋转的短球，你会：',
    options: ['先搓一板过渡，看清再说', '搓长或摆短，控制落点', '直接拧拉/挑打，先上手'] },
  { dim: 'receive', text: '对手发了一个急长球到你反手位，你会：',
    options: ['被动起板或者搓一个保证上台', '反手主动摩擦起板', '侧身发力起板'] },
  { dim: 'receive', text: '对手发球很好，你连续三个接发球失误，你会：',
    options: ['更保守，先确保接回去', '调整站位和判断，继续积极接', '坚持抢攻，不能让对手舒服地衔接'] },
  { dim: 'receive', text: '你接发球时的主要目标是：',
    options: ['安全回球，不给对手机会', '控制落点，限制对手第三板', '主动抢攻，争取先上手'] },
  { dim: 'receive', text: '对手发了一个短下旋到你正手位，你会：',
    options: ['轻搓回对手反手位，保证不失误', '加转摆短或劈长，控制落点', '直接拧拉/挑打上手'] },

  // === 正反手偏好 ===
  { dim: 'hand', text: '相持中球来到中间位置，正反手都能够到，你会：',
    options: ['习惯性用反手处理', '看情况，哪边顺手用哪边', '侧身用正手拉'] },
  { dim: 'hand', text: '你觉得自己最有威胁的技术是：',
    options: ['反手拉/弹或反手拧拉', '正反手差不多', '正手拉球或正手冲球'] },
  { dim: 'hand', text: '练球时你花更多时间练什么？',
    options: ['反手技术练得更多', '正反手差不多', '正手技术练得更多'] },
  { dim: 'hand', text: '对手攻你中路追身，你的第一反应是：',
    options: ['用反手快带一板', '看来球方向再决定', '侧身让开用正手'] },
  { dim: 'hand', text: '如果只能选一项加强，你会选：',
    options: ['提升反手质量', '提升正反手转换衔接', '提升正手质量'] },
];

var LABELS_3 = ['A', 'B', 'C'];

var ARCHETYPES = [
  { id: 'berserker', name: '狂战士', emoji: '🔥', subtitle: '进攻就是最好的防守',
    check: function(s) { return s.attack >= 60 && s.rhythm >= 60; },
    summary: '你是球场上的狂战士，追求极致的进攻速度和压迫力。' },
  { id: 'tactician', name: '兵法大师', emoji: '🧠', subtitle: '每一分都是算计好的',
    check: function(s) { return s.flexibility >= 60 && s.serve >= 60; },
    summary: '你善于阅读比赛、调整战术，用变化多端的策略让对手永远猜不透。' },
  { id: 'clutch', name: '关键先生', emoji: '🏆', subtitle: '越到关键时刻越强',
    check: function(s) { return s.pressure >= 60 && s.attack >= 50; },
    summary: '你在压力下反而能爆发出更强的战斗力，关键时刻是你的舞台。' },
  { id: 'wall', name: '铜墙铁壁', emoji: '🧱', subtitle: '你永远不会主动输',
    check: function(s) { return s.attack < 40 && s.pressure >= 50; },
    summary: '你的防守极其稳定，心理素质过硬，能把比赛拖入你擅长的节奏。' },
  { id: 'controller', name: '节奏大师', emoji: '🎵', subtitle: '比赛的节奏由我定',
    check: function(s) { return s.rhythm < 40 && s.flexibility >= 50; },
    summary: '你擅长用节奏变化和战术调整控制比赛走向。' },
  { id: 'allrounder', name: '全能战士', emoji: '⭐', subtitle: '各项均衡，没有明显短板',
    check: function(s) {
      var vals = [s.attack, s.flexibility, s.pressure, s.rhythm, s.serve, s.receive];
      var mn = Math.min.apply(null, vals); var mx = Math.max.apply(null, vals);
      return mx - mn < 25 && mn >= 35;
    },
    summary: '你在各个维度上都没有明显短板，能适应各种对手和场景。' },
  { id: 'default', name: '复合型选手', emoji: '🏓', subtitle: '独特的风格组合',
    check: function() { return true; },
    summary: '你的比赛风格是多种特质的独特组合，在不同场景下会展现不同的面貌。' },
];

function getArchetype(scores) {
  for (var i = 0; i < ARCHETYPES.length; i++) { if (ARCHETYPES[i].check(scores)) return ARCHETYPES[i]; }
  return ARCHETYPES[ARCHETYPES.length - 1];
}

function shuffleArray(arr) {
  var a = arr.map(function(q, i) { return Object.assign({}, q, { origIndex: i }); });
  for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
  return a;
}

function RadarChart(props) {
  var scores = props.scores;
  var w = 500, h = 420;
  var cx = w / 2, cy = h / 2, rr = 100;
  var n = DIMENSIONS.length;
  var step = (2 * Math.PI) / n, start = -Math.PI / 2;
  function gp(i, v) { var a = start + i * step; var d = (v / 100) * rr; return [cx + d * Math.cos(a), cy + d * Math.sin(a)]; }
  var grid = [20, 40, 60, 80, 100];
  var dp = DIMENSIONS.map(function(d, i) { return gp(i, scores[d.key] || 0); });
  var poly = dp.map(function(p) { return p.join(','); }).join(' ');
  var lpos = [
    { x: cx, y: 18, a: 'middle' },
    { x: cx + rr + 60, y: cy - rr * 0.55, a: 'start' },
    { x: cx + rr + 60, y: cy + rr * 0.2, a: 'start' },
    { x: cx + rr * 0.3, y: cy + rr + 35, a: 'start' },
    { x: cx - rr * 0.3, y: cy + rr + 35, a: 'end' },
    { x: cx - rr - 60, y: cy + rr * 0.2, a: 'end' },
    { x: cx - rr - 60, y: cy - rr * 0.55, a: 'end' },
  ];
  return (
    <svg viewBox={'0 0 ' + w + ' ' + h} style={{ width: '100%', maxWidth: w }}>
      {grid.map(function(l) { var pts = DIMENSIONS.map(function(_, i) { return gp(i, l).join(','); }).join(' '); return <polygon key={l} points={pts} fill="none" stroke="#e5e7eb" strokeWidth="1" />; })}
      {DIMENSIONS.map(function(_, i) { var p = gp(i, 100); return <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#e5e7eb" strokeWidth="1" />; })}
      <polygon points={poly} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="2.5" />
      {dp.map(function(p, i) { return <circle key={i} cx={p[0]} cy={p[1]} r="4" fill="#3b82f6" />; })}
      {DIMENSIONS.map(function(d, i) { var l = lpos[i]; return <text key={i} x={l.x} y={l.y} textAnchor={l.a} dominantBaseline="central" style={{ fontSize: 12, fontWeight: 600, fill: '#374151' }}>{d.icon + ' ' + d.name}</text>; })}
      {dp.map(function(p, i) { var v = scores[DIMENSIONS[i].key] || 0; return <text key={'v' + i} x={p[0]} y={p[1] - 14} textAnchor="middle" style={{ fontSize: 11, fontWeight: 700, fill: '#3b82f6' }}>{Math.round(v)}</text>; })}
    </svg>
  );
}

function ProgressBar(props) {
  return (
    <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: props.value + '%', height: '100%', background: props.color || '#3b82f6', borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  );
}

var dimColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#6366f1', '#ec4899'];

var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
var SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function submitRating(payload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) { console.log('[Demo]', payload); return Promise.resolve({ ok: true }); }
  return fetch(SUPABASE_URL + '/rest/v1/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': 'Bearer ' + SUPABASE_ANON_KEY, 'Prefer': 'return=minimal' }, body: JSON.stringify(payload) });
}

function RatingWidget(props) {
  var _r1 = useState(0), rating = _r1[0], setRating = _r1[1];
  var _r2 = useState(0), hover = _r2[0], setHover = _r2[1];
  var _r3 = useState('idle'), status = _r3[0], setStatus = _r3[1];
  var _r4 = useState(''), feedback = _r4[0], setFeedback = _r4[1];
  function handleSubmit() {
    if (!rating) return; setStatus('submitting');
    submitRating({ rating: rating, feedback: feedback || null, archetype: props.archetype.id, scores: JSON.stringify(props.scores), profile: JSON.stringify(props.profile), created_at: new Date().toISOString() })
      .then(function() { setStatus('done'); })['catch'](function() { setStatus('done'); });
  }
  if (status === 'done') return <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid #bbf7d0', textAlign: 'center' }}><div style={{ fontSize: 28, marginBottom: 8 }}>✅</div><p style={{ fontSize: 14, fontWeight: 600, color: '#166534', margin: 0 }}>感谢反馈！</p></div>;
  var stars = [1, 2, 3, 4, 5]; var sl = ['完全不准', '不太准', '一般', '比较准', '非常准'];
  return (
    <div style={{ background: '#fefce8', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid #fde68a' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#92400e', margin: '0 0 6px' }}>⭐ 你觉得这个结果准不准？</h3>
      <p style={{ fontSize: 13, color: '#a16207', margin: '0 0 14px' }}>你的评分将帮助我们优化测试</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
        {stars.map(function(s) { var ac = s <= (hover || rating); return <button key={s} onMouseEnter={function() { setHover(s); }} onMouseLeave={function() { setHover(0); }} onClick={function() { setRating(s); }} style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', transform: ac ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s', filter: ac ? 'none' : 'grayscale(1) opacity(0.4)' }}>⭐</button>; })}
      </div>
      {rating > 0 && <div style={{ textAlign: 'center', marginBottom: 12 }}><span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{sl[rating - 1]}</span></div>}
      {rating > 0 && <div>
        <textarea value={feedback} onChange={function(e) { setFeedback(e.target.value); }} placeholder="可选：告诉我们哪里不准或有什么建议..." style={{ width: '100%', minHeight: 60, padding: 12, fontSize: 13, border: '1px solid #fde68a', borderRadius: 10, resize: 'vertical', fontFamily: 'inherit', background: '#fffef5', boxSizing: 'border-box' }} />
        <button onClick={handleSubmit} disabled={status === 'submitting'} style={{ width: '100%', marginTop: 10, padding: '12px 0', fontSize: 14, fontWeight: 700, background: status === 'submitting' ? '#d1d5db' : '#f59e0b', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}>{status === 'submitting' ? '提交中...' : '提交评分'}</button>
      </div>}
    </div>
  );
}

var PLAY_YEARS = ['<1年', '1-3年', '3-5年', '5-10年', '10+年'];
var PLAY_STYLES = ['横拍两面反胶', '横拍颗粒', '削球', '直拍两面反胶', '直拍颗粒'];
var HANDS = ['右手', '左手'];

export default function App() {
  var _s1 = useState('intro'), phase = _s1[0], setPhase = _s1[1];
  var _s2 = useState([]), shuffled = _s2[0], setShuffled = _s2[1];
  var _s3 = useState({}), answers = _s3[0], setAnswers = _s3[1];
  var _s4 = useState(0), currentQ = _s4[0], setCurrentQ = _s4[1];
  var _s5 = useState({}), scores = _s5[0], setScores = _s5[1];
  var _s6 = useState({}), profile = _s6[0], setProfile = _s6[1];
  var resultRef = useRef(null);

  function startTest() { setShuffled(shuffleArray(QUESTIONS)); setAnswers({}); setCurrentQ(0); setPhase('test'); }
  function handleAnswer(qIdx, val) { var na = Object.assign({}, answers); na[qIdx] = val; setAnswers(na); if (currentQ < shuffled.length - 1) setTimeout(function() { setCurrentQ(currentQ + 1); }, 150); }

  var calcScores = useCallback(function() {
    var ds = {};
    DIMENSIONS.forEach(function(d) {
      var qs = shuffled.filter(function(q) { return q.dim === d.key; });
      var total = 0;
      qs.forEach(function(q) { var idx = shuffled.indexOf(q); var raw = answers[idx] !== undefined ? answers[idx] : 1; total += raw; });
      ds[d.key] = (total / (qs.length * 2)) * 100;
    });
    return ds;
  }, [shuffled, answers]);

  var allAnswered = shuffled.length > 0 && shuffled.every(function(_, i) { return answers[i] !== undefined; });
  function showResult() { setScores(calcScores()); setPhase('result'); window.scrollTo(0, 0); }

  useEffect(function() { if (phase === 'result' && resultRef.current) resultRef.current.scrollIntoView({ behavior: 'smooth' }); }, [phase]);

  var progress = shuffled.length > 0 ? (Object.keys(answers).length / shuffled.length) * 100 : 0;
  var font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  // ===== INTRO =====
  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: font }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏓</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>乒乓球打法人格测试</h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0, lineHeight: 1.6 }}>通过情境选择题，发现你在比赛中的决策人格</p>
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 16px' }}>📊 七大测评维度</h3>
          {DIMENSIONS.map(function(d, i) { return (
            <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 6 ? 12 : 0 }}>
              <span style={{ fontSize: 20 }}>{d.icon}</span>
              <div><div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{d.name}</div><div style={{ fontSize: 12, color: '#9ca3af' }}>{d.desc}</div></div>
            </div>);
          })}
        </div>
        <div style={{ background: '#eff6ff', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#1e40af', margin: 0, lineHeight: 1.6 }}>{'💡 每道题描述一个比赛情境，选择最接近你真实反应的选项。共' + QUESTIONS.length + '题，约需5分钟。'}</p>
        </div>
        <button onClick={function() { setPhase('profile'); }} style={{ width: '100%', padding: '16px 0', fontSize: 17, fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>开始测试 →</button>
      </div>
    );
  }

  // ===== PROFILE =====
  if (phase === 'profile') {
    var canStart = profile.years && profile.style && profile.hand;
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: font }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#111827', margin: '0 0 4px' }}>📝 基本信息</h2>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 20px' }}>帮助我们更准确地分析你的打法风格</p>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>球龄</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PLAY_YEARS.map(function(y) { var sel = profile.years === y; return <button key={y} onClick={function() { setProfile(Object.assign({}, profile, { years: y })); }} style={{ padding: '8px 16px', fontSize: 14, fontWeight: sel ? 700 : 500, background: sel ? '#eff6ff' : '#fff', color: sel ? '#2563eb' : '#374151', border: sel ? '2px solid #3b82f6' : '2px solid #e5e7eb', borderRadius: 10, cursor: 'pointer' }}>{y}</button>; })}
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>打法类型</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {PLAY_STYLES.map(function(s) { var sel = profile.style === s; return <button key={s} onClick={function() { setProfile(Object.assign({}, profile, { style: s })); }} style={{ padding: '8px 16px', fontSize: 14, fontWeight: sel ? 700 : 500, background: sel ? '#eff6ff' : '#fff', color: sel ? '#2563eb' : '#374151', border: sel ? '2px solid #3b82f6' : '2px solid #e5e7eb', borderRadius: 10, cursor: 'pointer' }}>{s}</button>; })}
          </div>
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>持拍手</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {HANDS.map(function(h) { var sel = profile.hand === h; return <button key={h} onClick={function() { setProfile(Object.assign({}, profile, { hand: h })); }} style={{ padding: '8px 24px', fontSize: 14, fontWeight: sel ? 700 : 500, background: sel ? '#eff6ff' : '#fff', color: sel ? '#2563eb' : '#374151', border: sel ? '2px solid #3b82f6' : '2px solid #e5e7eb', borderRadius: 10, cursor: 'pointer' }}>{h}</button>; })}
          </div>
        </div>
        <button disabled={!canStart} onClick={startTest} style={{ width: '100%', padding: '14px 0', fontSize: 16, fontWeight: 700, background: canStart ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 12, cursor: canStart ? 'pointer' : 'default' }}>继续 →</button>
      </div>
    );
  }

  // ===== TEST =====
  if (phase === 'test') {
    var q = shuffled[currentQ];
    var dimIndex = DIMENSIONS.findIndex(function(d) { return d.key === q.dim; });
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: font }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>{'第 ' + (currentQ + 1) + ' / ' + shuffled.length + ' 题'}</span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{Math.round(progress) + '%'}</span>
          </div>
          <ProgressBar value={progress} />
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 16, padding: 24, marginBottom: 20, borderLeft: '4px solid ' + dimColors[dimIndex] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>{DIMENSIONS[dimIndex].icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: dimColors[dimIndex] }}>{DIMENSIONS[dimIndex].name}</span>
          </div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#1f2937', margin: 0, lineHeight: 1.6 }}>{q.text}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {q.options.map(function(opt, i) {
            var sel = answers[currentQ] === i;
            return (
              <button key={i} onClick={function() { handleAnswer(currentQ, i); }} style={{ padding: '14px 18px', fontSize: 14, fontWeight: sel ? 700 : 500, background: sel ? '#eff6ff' : '#fff', color: sel ? '#2563eb' : '#374151', border: sel ? '2px solid #3b82f6' : '2px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', lineHeight: 1.5 }}>
                <span style={{ display: 'inline-block', width: 24, fontWeight: 700, color: sel ? '#2563eb' : '#9ca3af' }}>{LABELS_3[i]}</span>{opt}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button disabled={currentQ === 0} onClick={function() { setCurrentQ(currentQ - 1); }} style={{ flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600, background: '#f3f4f6', color: currentQ === 0 ? '#d1d5db' : '#374151', border: 'none', borderRadius: 10, cursor: currentQ === 0 ? 'default' : 'pointer' }}>← 上一题</button>
          {currentQ < shuffled.length - 1 ? (
            <button disabled={answers[currentQ] === undefined} onClick={function() { setCurrentQ(currentQ + 1); }} style={{ flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600, background: answers[currentQ] !== undefined ? '#3b82f6' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 10, cursor: answers[currentQ] !== undefined ? 'pointer' : 'default' }}>下一题 →</button>
          ) : (
            <button disabled={!allAnswered} onClick={showResult} style={{ flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 700, background: allAnswered ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 10, cursor: allAnswered ? 'pointer' : 'default' }}>🎯 查看结果</button>
          )}
        </div>
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
          {shuffled.map(function(_, i) { return <button key={i} onClick={function() { setCurrentQ(i); }} style={{ width: 26, height: 26, fontSize: 10, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', background: i === currentQ ? '#3b82f6' : answers[i] !== undefined ? '#bfdbfe' : '#f3f4f6', color: i === currentQ ? '#fff' : answers[i] !== undefined ? '#1e40af' : '#9ca3af' }}>{i + 1}</button>; })}
        </div>
      </div>
    );
  }

  // ===== RESULT =====
  var archetype = getArchetype(scores);
  var dimEntries = DIMENSIONS.map(function(d) { return { key: d.key, name: d.name, score: scores[d.key] || 0 }; });
  dimEntries.sort(function(a, b) { return b.score - a.score; });

  return (
    <div ref={resultRef} style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: font }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', borderRadius: 20, padding: 32, marginBottom: 24, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{archetype.emoji}</div>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, letterSpacing: 2, marginBottom: 4 }}>你的乒乓球打法人格</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>{archetype.name}</h2>
        <p style={{ fontSize: 14, opacity: 0.85, margin: '0 0 16px', fontStyle: 'italic' }}>{archetype.subtitle}</p>
      </div>
      <div style={{ background: '#f0f9ff', borderRadius: 14, padding: 20, marginBottom: 24, border: '1px solid #bfdbfe' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1e40af', margin: '0 0 8px' }}>📝 综合分析</h3>
        <p style={{ fontSize: 14, color: '#1e3a5f', margin: 0, lineHeight: 1.8 }}>{archetype.summary}</p>
      </div>
      <div style={{ background: '#f9fafb', borderRadius: 16, padding: 20, marginBottom: 24, textAlign: 'center' }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 12px' }}>📊 能力雷达图</h3>
        <RadarChart scores={scores} />
      </div>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 14px' }}>🔍 分维度详解</h3>
      {DIMENSIONS.map(function(d, i) {
        var score = Math.round(scores[d.key] || 0);
        var pct = score;
        var descText = pct + '分 — ';
        if (d.key === 'hand') { descText += pct < 35 ? '你明显偏反手主导，反手是你的主要武器。' : pct > 65 ? '你明显偏正手主导，正手是你的核心威胁。' : '你的正反手使用比较均衡，两面都能发起进攻。'; }
        else { descText += pct < 30 ? '非常偏向' + d.low + '。' : pct < 45 ? '偏向' + d.low + '。' : pct > 70 ? '非常偏向' + d.high + '。' : pct > 55 ? '偏向' + d.high + '。' : d.low + '和' + d.high + '之间比较均衡。'; }
        return (
          <div key={d.key} style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 14, border: '1px solid #e5e7eb', borderLeft: '4px solid ' + dimColors[i] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{d.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{d.name}</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, color: dimColors[i] }}>{score}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: '#9ca3af', minWidth: 50, textAlign: 'right' }}>{d.low}</span>
              <div style={{ flex: 1 }}><ProgressBar value={score} color={dimColors[i]} /></div>
              <span style={{ fontSize: 11, color: '#9ca3af', minWidth: 50 }}>{d.high}</span>
            </div>
            <p style={{ fontSize: 13, color: '#4b5563', margin: '8px 0 0', lineHeight: 1.7 }}>{descText}</p>
          </div>
        );
      })}
      <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#92400e', margin: 0, lineHeight: 1.6 }}>⚠️ 本测试仅供参考，不代表专业评估。你的风格会随训练和经验不断演变。</p>
      </div>
      <RatingWidget scores={scores} archetype={archetype} profile={profile} />
      <button onClick={function() { setPhase('intro'); setScores({}); setAnswers({}); setProfile({}); }} style={{ width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, cursor: 'pointer' }}>🔄 重新测试</button>
    </div>
  );
}
