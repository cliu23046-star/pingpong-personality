import { useState, useRef, useEffect, useCallback } from "react";

var DIMENSIONS = [
  { key: 'attack', name: '攻防倾向', icon: '⚔️', desc: '主动进攻 vs 稳守反击' },
  { key: 'flexibility', name: '战术弹性', icon: '🔄', desc: '灵活应变 vs 体系执行' },
  { key: 'pressure', name: '压力应对', icon: '🧠', desc: '逆境爆发 vs 冷静自控' },
  { key: 'rhythm', name: '节奏控制', icon: '⏱️', desc: '加速抢攻 vs 慢节奏博弈' },
  { key: 'serve', name: '发接发博弈', icon: '🏓', desc: '变化多端 vs 稳定压制' },
];

var QUESTIONS = [
  { dim: 'attack', text: '比赛进入关键分（如10:10），我更倾向于主动发力进攻。', reversed: false },
  { dim: 'attack', text: '当对手连续进攻时，我会选择先防住再寻找反击机会，而不是硬拼。', reversed: true },
  { dim: 'attack', text: '接发球时，如果机会一般，我也更愿意尝试抢攻而不是过渡。', reversed: false },
  { dim: 'attack', text: '我认为\u201c少失误\u201d比\u201c多得分\u201d更重要。', reversed: true },
  { dim: 'attack', text: '即使对手防守很好，我也会持续加力而不是改变策略。', reversed: false },
  { dim: 'attack', text: '领先时我会适当放慢节奏、减少冒险，保住优势。', reversed: true },
  { dim: 'flexibility', text: '如果一种打法连丢3分，我会马上尝试不同的战术。', reversed: false },
  { dim: 'flexibility', text: '我习惯赛前制定计划，比赛中严格执行。', reversed: true },
  { dim: 'flexibility', text: '面对没见过的打法（如长胶、怪球手），我觉得反而有趣而不是烦躁。', reversed: false },
  { dim: 'flexibility', text: '我更相信\u201c一招鲜吃遍天\u201d，把自己最强的技术练到极致。', reversed: true },
  { dim: 'flexibility', text: '比赛中我会根据对手的站位和习惯随时调整落点。', reversed: false },
  { dim: 'flexibility', text: '暂停或擦汗时，我很少重新思考战术，更多是调整心态。', reversed: true },
  { dim: 'pressure', text: '局分0:2落后时，我反而会更兴奋，觉得逆转很刺激。', reversed: false },
  { dim: 'pressure', text: '关键分时我的手会紧、动作会变形。', reversed: true },
  { dim: 'pressure', text: '被对手连续得分后，我能快速忘掉上一个球，专注下一个球。', reversed: false },
  { dim: 'pressure', text: '观众多的时候，我的发挥会明显不如平时。', reversed: true },
  { dim: 'pressure', text: '决胜局我觉得是展现自己的舞台，而不是煎熬。', reversed: false },
  { dim: 'pressure', text: '比赛中出现争议判罚后，我很难在接下来几个球集中注意力。', reversed: true },
  { dim: 'rhythm', text: '我喜欢快速发球、快速上手，不给对手思考时间。', reversed: false },
  { dim: 'rhythm', text: '当我占据主动时，我会刻意放慢发球节奏来\u201c冻住\u201d对手。', reversed: true },
  { dim: 'rhythm', text: '相持中我倾向于在前三板就解决战斗。', reversed: false },
  { dim: 'rhythm', text: '我经常用擦汗、系鞋带等方式打断对手的节奏。', reversed: true },
  { dim: 'rhythm', text: '对手节奏很慢时，我会感到不适应甚至急躁。', reversed: false },
  { dim: 'rhythm', text: '我更享受多拍相持的回合，而不是一板过的快感。', reversed: true },
  { dim: 'serve', text: '我的发球种类超过5种（不同旋转/落点组合），并且会在比赛中都使用。', reversed: false },
  { dim: 'serve', text: '关键分时我倾向于用最有把握的1-2种发球，而不是出其不意。', reversed: true },
  { dim: 'serve', text: '接发球时，我会根据对手的发球动作预判旋转，而不是等球过来再反应。', reversed: false },
  { dim: 'serve', text: '我觉得发球最重要的是不出台、不失误，而不是追求高质量。', reversed: true },
  { dim: 'serve', text: '每场比赛我都会试探对手接发球的弱点，然后针对性发球。', reversed: false },
  { dim: 'serve', text: '面对看不清的发球，我倾向于搓回去而不是大胆拉起来。', reversed: true },
];

var LABELS = ['完全不符', '比较不符', '一般', '比较符合', '非常符合'];

var PROFILES = {
  attack: [
    { min: 0, max: 40, title: '铜墙铁壁型', desc: '你的比赛哲学是\u201c让对手犯错\u201d。在关键时刻你倾向于稳扎稳打，用高质量的防守消耗对手。建议：适当增加主动进攻的比例，尤其在领先时要敢于上手。' },
    { min: 40, max: 60, title: '攻守均衡型', desc: '你能根据场上情况灵活切换攻防角色，这是非常成熟的比赛风格。建议：继续强化转换球的质量，在防转攻的衔接上做文章。' },
    { min: 60, max: 101, title: '暴力输出型', desc: '你信奉\u201c进攻是最好的防守\u201d。在任何时候你都倾向于主动发力。建议：学会在关键分适当收力增加稳定性，80%力量的进攻往往比100%更有效。' },
  ],
  flexibility: [
    { min: 0, max: 40, title: '体系执行者', desc: '你善于把自己最擅长的战术执行到极致，比赛思路清晰。建议：面对怪球手或陌生打法时，准备2-3套备用方案。' },
    { min: 40, max: 60, title: '策略平衡者', desc: '你既有核心战术体系，又能在必要时做出调整，战术成熟度较高。建议：训练中多模拟不同场景的战术切换。' },
    { min: 60, max: 101, title: '百变战术师', desc: '你享受战术博弈的过程，善于阅读比赛并随时调整。建议：找到2-3个核心武器作为战术支点。' },
  ],
  pressure: [
    { min: 0, max: 40, title: '敏感内耗型', desc: '比赛压力会明显影响你的发挥和决策。这很正常，很多职业选手也曾如此。建议：建立固定的比赛仪式感，多参加实战积累经验。' },
    { min: 40, max: 60, title: '稳定发挥型', desc: '你在大多数情况下能保持合理的竞技状态，但极端压力下偶有波动。建议：记录让你紧张的具体场景，针对性模拟训练。' },
    { min: 60, max: 101, title: '大心脏选手', desc: '你在压力下反而能激发更高水平的表现，享受关键时刻的紧张感。建议：利用这个优势在关键分主动出击。' },
  ],
  rhythm: [
    { min: 0, max: 40, title: '太极推手型', desc: '你善于用节奏变化控制比赛走向，让对手打不出自己的节奏。建议：注意不要过度拖慢导致自己也冷下来。' },
    { min: 40, max: 60, title: '节奏调和者', desc: '你能根据需要在快慢之间切换，对比赛节奏有较好的掌控力。建议：练习在同一回合中改变节奏。' },
    { min: 60, max: 101, title: '闪电突击型', desc: '你追求快速解决战斗，前三板是你的主战场。建议：当快攻受阻时，能否主动慢下来是提升关键。' },
  ],
  serve: [
    { min: 0, max: 40, title: '稳健保守型', desc: '你的发接发策略以安全为先。建议：发球是唯一完全由自己掌控的环节，值得投入更多练习。' },
    { min: 40, max: 60, title: '务实策略型', desc: '你有一定的发接发套路，并能在比赛中合理运用。建议：强化发球与第三板的衔接。' },
    { min: 60, max: 101, title: '诡变发球大师', desc: '你把发接发当作心理战，善于用变化制造对手的犹豫和失误。建议：保持变化同时确保每种发球的质量。' },
  ],
};

var ARCHETYPES = [
  {
    id: 'berserker', name: '狂战士', emoji: '🔥',
    subtitle: '进攻就是最好的防守',
    check: function(s) { return s.attack >= 60 && s.rhythm >= 60; },
    summary: '你是球场上的\u201c狂战士\u201d！你追求极致的进攻速度和压迫力，在前三板就要解决战斗。你的对手往往还没反应过来，比赛就已经结束。提升空间：当暴力进攻受阻时，学会主动慢下来重新组织进攻，而不是一味加力。'
  },
  {
    id: 'tactician', name: '兵法大师', emoji: '🧠',
    subtitle: '每一分都是算计好的',
    check: function(s) { return s.flexibility >= 60 && s.serve >= 60; },
    summary: '你是球场上的\u201c兵法大师\u201d！你善于阅读比赛、调整战术，用变化多端的发球和灵活的策略让对手永远猜不透你的下一板。提升空间：确保变化中有核心体系，避免战术过多反而分散自己的注意力。'
  },
  {
    id: 'clutch', name: '关键先生', emoji: '🏆',
    subtitle: '越到关键时刻越强',
    check: function(s) { return s.pressure >= 60 && s.attack >= 50; },
    summary: '你是球场上的\u201c关键先生\u201d！你在压力下反而能爆发出更强的战斗力，决胜局和关键分是你的舞台。队友们都想在关键时刻把球交给你。提升空间：注意在非关键时刻也保持专注，避免只在关键分\u201c开开\u201d。'
  },
  {
    id: 'wall', name: '铜墙铁壁', emoji: '🧱',
    subtitle: '你永远不会主动输',
    check: function(s) { return s.attack < 40 && s.pressure >= 50; },
    summary: '你是球场上的\u201c铜墙铁壁\u201d！你的比赛哲学是让对手自己犯错。你的防守极其稳定，心理素质过硬，能把任何比赛拖入你擅长的节奏。提升空间：适当增加主动进攻的比例，让对手无法预判你的套路。'
  },
  {
    id: 'controller', name: '节奏大师', emoji: '🎵',
    subtitle: '比赛的节奏由我定',
    check: function(s) { return s.rhythm < 40 && s.flexibility >= 50; },
    summary: '你是球场上的\u201c节奏大师\u201d！你擅长用节奏变化和战术调整控制比赛走向，让对手始终打不出自己的节奏。你的比赛像一盘棋局，每一步都有深意。提升空间：确保慢节奏不会让自己也失去手感。'
  },
  {
    id: 'allrounder', name: '全能战士', emoji: '⭐',
    subtitle: '没有明显短板，各项均衡',
    check: function(s) {
      var vals = [s.attack, s.flexibility, s.pressure, s.rhythm, s.serve];
      var mn = Math.min.apply(null, vals);
      var mx = Math.max.apply(null, vals);
      return mx - mn < 25 && mn >= 35;
    },
    summary: '你是球场上的\u201c全能战士\u201d！你在各个维度上都没有明显短板，攻防平衡、战术灵活、心理稳定。你能适应各种对手和场景，是团队中最可靠的球员。提升空间：在均衡的基础上发展出1-2个特别突出的优势项。'
  },
  {
    id: 'default', name: '复合型选手', emoji: '🏓',
    subtitle: '独特的风格组合',
    check: function() { return true; },
    summary: '你的比赛风格是多种特质的独特组合，不属于典型的某一类。这意味着你在不同场景下会展现不同的面貌，让对手难以研究你的套路。提升空间：找到你最核心的竞争优势，围绕它构建更系统的比赛体系。'
  },
];

function getArchetype(scores) {
  for (var i = 0; i < ARCHETYPES.length; i++) {
    if (ARCHETYPES[i].check(scores)) return ARCHETYPES[i];
  }
  return ARCHETYPES[ARCHETYPES.length - 1];
}

function shuffleArray(arr) {
  var a = arr.map(function(q, i) { return Object.assign({}, q, { origIndex: i }); });
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
  }
  return a;
}

function RadarChart(props) {
  var scores = props.scores;
  var w = 500, h = 380;
  var cx = w / 2, cy = h / 2;
  var rr = 110;
  var n = DIMENSIONS.length;
  var angleStep = (2 * Math.PI) / n;
  var startAngle = -Math.PI / 2;

  function getPoint(i, val) {
    var angle = startAngle + i * angleStep;
    var dist = (val / 100) * rr;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  }

  var gridLevels = [20, 40, 60, 80, 100];
  var dataPoints = DIMENSIONS.map(function(d, i) { return getPoint(i, scores[d.key] || 0); });
  var polygon = dataPoints.map(function(p) { return p.join(','); }).join(' ');

  var labelPos = [
    { x: cx, y: cy - rr - 30, anchor: 'middle' },
    { x: cx + rr + 20, y: cy - rr * 0.25, anchor: 'start' },
    { x: cx + rr * 0.55, y: cy + rr + 28, anchor: 'start' },
    { x: cx - rr * 0.55, y: cy + rr + 28, anchor: 'end' },
    { x: cx - rr - 20, y: cy - rr * 0.25, anchor: 'end' },
  ];

  return (
    <svg viewBox={'0 0 ' + w + ' ' + h} style={{ width: '100%', maxWidth: w }} overflow="visible">
      {gridLevels.map(function(level) {
        var pts = DIMENSIONS.map(function(_, i) { return getPoint(i, level).join(','); }).join(' ');
        return <polygon key={level} points={pts} fill="none" stroke="#e5e7eb" strokeWidth="1" />;
      })}
      {DIMENSIONS.map(function(_, i) {
        var pt = getPoint(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={pt[0]} y2={pt[1]} stroke="#e5e7eb" strokeWidth="1" />;
      })}
      <polygon points={polygon} fill="rgba(59,130,246,0.2)" stroke="#3b82f6" strokeWidth="2.5" />
      {dataPoints.map(function(pt, i) {
        return <circle key={i} cx={pt[0]} cy={pt[1]} r="4" fill="#3b82f6" />;
      })}
      {DIMENSIONS.map(function(d, i) {
        var lp = labelPos[i];
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor={lp.anchor} dominantBaseline="central"
            style={{ fontSize: 13, fontWeight: 600, fill: '#374151' }}>
            {d.icon + ' ' + d.name}
          </text>
        );
      })}
      {dataPoints.map(function(pt, i) {
        var val = scores[DIMENSIONS[i].key] || 0;
        return (
          <text key={'v' + i} x={pt[0]} y={pt[1] - 14} textAnchor="middle"
            style={{ fontSize: 12, fontWeight: 700, fill: '#3b82f6' }}>
            {Math.round(val)}
          </text>
        );
      })}
    </svg>
  );
}

function ProgressBar(props) {
  var value = props.value;
  var color = props.color || '#3b82f6';
  return (
    <div style={{ width: '100%', height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{ width: value + '%', height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
    </div>
  );
}

var dimColors = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

var SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
var SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function submitRating(payload) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('[Demo Mode] Would submit:', payload);
    return Promise.resolve({ ok: true });
  }
  return fetch(SUPABASE_URL + '/rest/v1/ratings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(payload)
  });
}

function RatingWidget(props) {
  var scores = props.scores;
  var archetype = props.archetype;
  var _r1 = useState(0);
  var rating = _r1[0], setRating = _r1[1];
  var _r2 = useState(0);
  var hover = _r2[0], setHover = _r2[1];
  var _r3 = useState('idle');
  var status = _r3[0], setStatus = _r3[1];
  var _r4 = useState('');
  var feedback = _r4[0], setFeedback = _r4[1];

  function handleSubmit() {
    if (rating === 0) return;
    setStatus('submitting');
    submitRating({
      rating: rating,
      feedback: feedback || null,
      archetype: archetype.id,
      scores: JSON.stringify(scores),
      created_at: new Date().toISOString()
    }).then(function() { setStatus('done'); })
      ['catch'](function() { setStatus('done'); });
  }

  if (status === 'done') {
    return (
      <div style={{ background: '#f0fdf4', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid #bbf7d0', textAlign: 'center' }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#166534', margin: 0 }}>感谢你的反馈！你的评分将帮助我们优化测试。</p>
      </div>
    );
  }

  var stars = [1, 2, 3, 4, 5];
  var starLabels = ['完全不准', '不太准', '一般', '比较准', '非常准'];

  return (
    <div style={{ background: '#fefce8', borderRadius: 14, padding: 20, marginBottom: 20, border: '1px solid #fde68a' }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#92400e', margin: '0 0 6px' }}>⭐ 你觉得这个结果准不准？</h3>
      <p style={{ fontSize: 13, color: '#a16207', margin: '0 0 14px' }}>你的评分将帮助我们持续优化测试算法</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
        {stars.map(function(s) {
          var active = s <= (hover || rating);
          return (
            <button key={s}
              onMouseEnter={function() { setHover(s); }}
              onMouseLeave={function() { setHover(0); }}
              onClick={function() { setRating(s); }}
              style={{ fontSize: 32, background: 'none', border: 'none', cursor: 'pointer', transform: active ? 'scale(1.15)' : 'scale(1)', transition: 'transform 0.15s ease', filter: active ? 'none' : 'grayscale(1) opacity(0.4)' }}>
              ⭐
            </button>
          );
        })}
      </div>
      {rating > 0 && (
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>{starLabels[rating - 1]}</span>
        </div>
      )}
      {rating > 0 && (
        <div>
          <textarea value={feedback} onChange={function(e) { setFeedback(e.target.value); }}
            placeholder="可选：告诉我们哪里不准或有什么建议..."
            style={{ width: '100%', minHeight: 60, padding: 12, fontSize: 13, border: '1px solid #fde68a', borderRadius: 10, resize: 'vertical', fontFamily: 'inherit', background: '#fffef5', boxSizing: 'border-box' }} />
          <button onClick={handleSubmit} disabled={status === 'submitting'} style={{
            width: '100%', marginTop: 10, padding: '12px 0', fontSize: 14, fontWeight: 700,
            background: status === 'submitting' ? '#d1d5db' : '#f59e0b',
            color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer'
          }}>
            {status === 'submitting' ? '提交中...' : '提交评分'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  var _s1 = useState('intro');
  var phase = _s1[0], setPhase = _s1[1];
  var _s2 = useState([]);
  var shuffled = _s2[0], setShuffled = _s2[1];
  var _s3 = useState({});
  var answers = _s3[0], setAnswers = _s3[1];
  var _s4 = useState(0);
  var currentQ = _s4[0], setCurrentQ = _s4[1];
  var _s5 = useState({});
  var scores = _s5[0], setScores = _s5[1];
  var resultRef = useRef(null);

  function startTest() {
    setShuffled(shuffleArray(QUESTIONS));
    setAnswers({});
    setCurrentQ(0);
    setPhase('test');
  }

  function handleAnswer(qIdx, val) {
    var newAnswers = Object.assign({}, answers);
    newAnswers[qIdx] = val;
    setAnswers(newAnswers);
    if (currentQ < shuffled.length - 1) {
      setTimeout(function() { setCurrentQ(currentQ + 1); }, 200);
    }
  }

  var calcScores = useCallback(function() {
    var dimScores = {};
    DIMENSIONS.forEach(function(d) {
      var qs = shuffled.filter(function(q) { return q.dim === d.key; });
      var total = 0;
      qs.forEach(function(q) {
        var idx = shuffled.indexOf(q);
        var raw = answers[idx] !== undefined ? answers[idx] : 3;
        total += q.reversed ? (6 - raw) : raw;
      });
      dimScores[d.key] = ((total - 6) / 24) * 100;
    });
    return dimScores;
  }, [shuffled, answers]);

  var allAnswered = shuffled.length > 0 && shuffled.every(function(_, i) { return answers[i] !== undefined; });

  function showResult() {
    var s = calcScores();
    setScores(s);
    setPhase('result');
    window.scrollTo(0, 0);
  }

  useEffect(function() {
    if (phase === 'result' && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [phase]);

  function getProfile(dimKey, score) {
    var profs = PROFILES[dimKey];
    for (var i = 0; i < profs.length; i++) {
      if (score >= profs[i].min && score < profs[i].max) return profs[i];
    }
    return profs[profs.length - 1];
  }

  var progress = shuffled.length > 0 ? (Object.keys(answers).length / shuffled.length) * 100 : 0;

  if (phase === 'intro') {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏓</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>乒乓球打法人格测试</h1>
          <p style={{ color: '#6b7280', fontSize: 15, margin: 0, lineHeight: 1.6 }}>基于运动心理学框架，通过30道情境题<br/>发现你在乒乓球比赛中的决策人格</p>
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 16, padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#374151', margin: '0 0 16px' }}>📊 五大测评维度</h3>
          {DIMENSIONS.map(function(d, i) {
            return (
              <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: i < 4 ? 12 : 0 }}>
                <span style={{ fontSize: 22 }}>{d.icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#1f2937' }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{d.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ background: '#eff6ff', borderRadius: 12, padding: 16, marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: '#1e40af', margin: 0, lineHeight: 1.6 }}>💡 没有对错之分，请根据你在比赛中的<strong>真实倾向</strong>作答。题目顺序随机，约需5分钟。</p>
        </div>
        <button onClick={startTest} style={{ width: '100%', padding: '16px 0', fontSize: 17, fontWeight: 700, background: 'linear-gradient(135deg, #3b82f6, #2563eb)', color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', boxShadow: '0 4px 14px rgba(59,130,246,0.35)' }}>
          开始测试 →
        </button>
      </div>
    );
  }

  if (phase === 'test') {
    var q = shuffled[currentQ];
    var dimIndex = DIMENSIONS.findIndex(function(d) { return d.key === q.dim; });
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>{'第 ' + (currentQ + 1) + ' / ' + shuffled.length + ' 题'}</span>
            <span style={{ fontSize: 13, color: '#9ca3af' }}>{Math.round(progress) + '%'}</span>
          </div>
          <ProgressBar value={progress} />
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 16, padding: 28, marginBottom: 24, borderLeft: '4px solid ' + dimColors[dimIndex] }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>{DIMENSIONS[dimIndex].icon}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: dimColors[dimIndex] }}>{DIMENSIONS[dimIndex].name}</span>
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#1f2937', margin: 0, lineHeight: 1.6 }}>{q.text}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {LABELS.map(function(label, i) {
            var val = i + 1;
            var selected = answers[currentQ] === val;
            return (
              <button key={val} onClick={function() { handleAnswer(currentQ, val); }} style={{ padding: '14px 18px', fontSize: 15, fontWeight: selected ? 700 : 500, background: selected ? '#eff6ff' : '#fff', color: selected ? '#2563eb' : '#374151', border: selected ? '2px solid #3b82f6' : '2px solid #e5e7eb', borderRadius: 12, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s ease' }}>
                {label}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button disabled={currentQ === 0} onClick={function() { setCurrentQ(currentQ - 1); }} style={{ flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600, background: '#f3f4f6', color: currentQ === 0 ? '#d1d5db' : '#374151', border: 'none', borderRadius: 10, cursor: currentQ === 0 ? 'default' : 'pointer' }}>
            ← 上一题
          </button>
          {currentQ < shuffled.length - 1 ? (
            <button disabled={answers[currentQ] === undefined} onClick={function() { setCurrentQ(currentQ + 1); }} style={{ flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 600, background: answers[currentQ] !== undefined ? '#3b82f6' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 10, cursor: answers[currentQ] !== undefined ? 'pointer' : 'default' }}>
              下一题 →
            </button>
          ) : (
            <button disabled={!allAnswered} onClick={showResult} style={{ flex: 1, padding: '12px 0', fontSize: 14, fontWeight: 700, background: allAnswered ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : '#d1d5db', color: '#fff', border: 'none', borderRadius: 10, cursor: allAnswered ? 'pointer' : 'default', boxShadow: allAnswered ? '0 4px 14px rgba(59,130,246,0.35)' : 'none' }}>
              🎯 查看结果
            </button>
          )}
        </div>
        <div style={{ marginTop: 20, display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
          {shuffled.map(function(_, i) {
            return (
              <button key={i} onClick={function() { setCurrentQ(i); }} style={{ width: 28, height: 28, fontSize: 11, fontWeight: 600, borderRadius: 6, border: 'none', cursor: 'pointer', background: i === currentQ ? '#3b82f6' : answers[i] !== undefined ? '#bfdbfe' : '#f3f4f6', color: i === currentQ ? '#fff' : answers[i] !== undefined ? '#1e40af' : '#9ca3af' }}>
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  var archetype = getArchetype(scores);
  var dimEntries = DIMENSIONS.map(function(d) { return { key: d.key, name: d.name, score: scores[d.key] || 0 }; });
  dimEntries.sort(function(a, b) { return b.score - a.score; });
  var strongest = dimEntries[0];
  var weakest = dimEntries[dimEntries.length - 1];

  return (
    <div ref={resultRef} style={{ maxWidth: 600, margin: '0 auto', padding: 24, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)', borderRadius: 20, padding: 32, marginBottom: 24, textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>{archetype.emoji}</div>
        <div style={{ fontSize: 13, fontWeight: 600, opacity: 0.8, letterSpacing: 2, marginBottom: 4 }}>你的乒乓球打法人格</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>{archetype.name}</h2>
        <p style={{ fontSize: 14, opacity: 0.85, margin: '0 0 20px', fontStyle: 'italic' }}>{archetype.subtitle}</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>最强项</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{strongest.name + ' ' + Math.round(strongest.score)}</div>
          </div>
          <div style={{ width: 1, background: 'rgba(255,255,255,0.3)' }}></div>
          <div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>提升项</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{weakest.name + ' ' + Math.round(weakest.score)}</div>
          </div>
        </div>
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
        var profile = getProfile(d.key, scores[d.key] || 0);
        return (
          <div key={d.key} style={{ background: '#fff', borderRadius: 14, padding: 20, marginBottom: 14, border: '1px solid #e5e7eb', borderLeft: '4px solid ' + dimColors[i] }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>{d.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{d.name}</span>
              </div>
              <span style={{ fontWeight: 800, fontSize: 20, color: dimColors[i] }}>{score}</span>
            </div>
            <ProgressBar value={score} color={dimColors[i]} />
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: dimColors[i], marginBottom: 4 }}>{profile.title}</div>
              <p style={{ fontSize: 13, color: '#4b5563', margin: 0, lineHeight: 1.7 }}>{profile.desc}</p>
            </div>
          </div>
        );
      })}
      <div style={{ background: '#fffbeb', borderRadius: 12, padding: 16, marginBottom: 20 }}>
        <p style={{ fontSize: 13, color: '#92400e', margin: 0, lineHeight: 1.6 }}>⚠️ 本测试仅供参考和娱乐，不代表专业运动心理学评估。你的打法风格会随着训练和比赛经验不断演变。</p>
      </div>
      <RatingWidget scores={scores} archetype={archetype} />
      <button onClick={function() { setPhase('intro'); setScores({}); setAnswers({}); }} style={{ width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700, background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 12, cursor: 'pointer' }}>
        🔄 重新测试
      </button>
    </div>
  );
}
