import { useState, useMemo, useCallback } from "react";

const C = {
  teal: { bg: "#E1F5EE", tx: "#085041", mid: "#1D9E75" },
  blue: { bg: "#E6F1FB", tx: "#0C447C", mid: "#378ADD" },
  coral: { bg: "#FAECE7", tx: "#712B13", mid: "#D85A30" },
  purple: { bg: "#EEEDFE", tx: "#3C3489", mid: "#534AB7" },
  amber: { bg: "#FAEEDA", tx: "#633806", mid: "#BA7517" },
  pink: { bg: "#FBEAF0", tx: "#72243E", mid: "#D4537E" },
  gray: { bg: "#F1EFE8", tx: "#444441", mid: "#888780" },
  red: { bg: "#FCEBEB", tx: "#791F1F", mid: "#E24B4A" },
  green: { bg: "#EAF3DE", tx: "#27500A", mid: "#639922" },
};
const fmt = n => (n < 0 ? "-" : "") + "¥" + Math.abs(Math.round(n)).toLocaleString();
const pct = n => Math.round(n * 100) + "%";
const MONTHS = ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"];

// ===== SHARED COMPONENTS =====
function Sec({ title, sub, right, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: sub ? 2 : 10, paddingBottom: 6, borderBottom: "1px solid #eee" }}>
        <span style={{ fontSize: 15, fontWeight: 500 }}>{title}</span>
        {right}
      </div>
      {sub && <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{sub}</div>}
      {children}
    </div>
  );
}
function G({ cols = 2, children }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))`, gap: 10 }}>{children}</div>;
}
function Metric({ label, value, color, sub }) {
  return (
    <div style={{ background: "#f5f5f0", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 500, color: color || "inherit" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function Sl({ label, value, onChange, min, max, step = 1, suffix = "" }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: "#888" }}>{label}</span>
        <span style={{ fontWeight: 500 }}>{value}{suffix}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(+e.target.value)} style={{ width: "100%" }} />
    </div>
  );
}
function Inp({ label, value, onChange, placeholder, prefix, suffix, type = "number" }) {
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {prefix && <span style={{ fontSize: 13, color: "#888" }}>{prefix}</span>}
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || ""} style={{ width: "100%", fontSize: 14, padding: "6px 8px", borderRadius: 6, border: "1px solid #ddd", background: "transparent", color: "inherit" }} />
        {suffix && <span style={{ fontSize: 13, color: "#888" }}>{suffix}</span>}
      </div>
    </div>
  );
}
function BarVis({ label, value, max, color }) {
  const w = max > 0 ? Math.min(100, (Math.abs(value) / max) * 100) : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
      <div style={{ fontSize: 12, color: "#888", minWidth: 90, textAlign: "right" }}>{label}</div>
      <div style={{ flex: 1, height: 18, background: "#f5f5f0", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ width: w + "%", height: "100%", background: color, borderRadius: 6 }} />
      </div>
      <div style={{ fontSize: 12, fontWeight: 500, minWidth: 70 }}>{fmt(value)}</div>
    </div>
  );
}
function MiniBar({ segments, height = 14 }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div style={{ display: "flex", height, borderRadius: 6, overflow: "hidden", background: "#f5f5f0" }}>
      {segments.map((s, i) => <div key={i} style={{ width: total > 0 ? (s.value / total * 100) + "%" : 0, background: s.color, height: "100%" }} />)}
    </div>
  );
}
function KPICard({ label, target, actual, unit = "", invert = false, format = "number" }) {
  const a = parseFloat(actual), t = parseFloat(target);
  const hasA = !isNaN(a), hasT = !isNaN(t) && t !== 0;
  let p = 0, status = "none", sc = C.gray;
  if (hasA && hasT) {
    p = invert ? (t / Math.max(a, 0.01)) * 100 : (a / t) * 100;
    if (p >= 100) { status = "达标"; sc = C.green; } else if (p >= 80) { status = "接近"; sc = C.amber; } else { status = "未达标"; sc = C.red; }
  }
  const dA = hasA ? (format === "money" ? fmt(a) : Math.round(a) + unit) : "—";
  const dT = hasT ? (format === "money" ? fmt(t) : Math.round(t) + unit) : "—";
  return (
    <div style={{ background: "#f5f5f0", borderRadius: 8, padding: "10px 12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: "#888" }}>{label}</span>
        {status !== "none" && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: sc.bg, color: sc.tx, fontWeight: 500 }}>{status} {Math.round(p)}%</span>}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontSize: 20, fontWeight: 500, color: hasA ? sc.mid : "inherit" }}>{dA}</span>
        <span style={{ fontSize: 12, color: "#aaa" }}>/ {dT}</span>
      </div>
      {hasA && hasT && <div style={{ marginTop: 6, height: 4, background: "#e8e8e4", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: Math.min(100, p) + "%", background: sc.mid, borderRadius: 2 }} /></div>}
    </div>
  );
}
function Pill({ text, color }) {
  return <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 4, background: color.bg, color: color.tx, fontWeight: 500 }}>{text}</span>;
}
function Btn({ children, onClick, active, small, color = C.teal }) {
  return <button onClick={onClick} style={{ padding: small ? "3px 10px" : "6px 14px", fontSize: small ? 12 : 13, borderRadius: 6, cursor: "pointer", background: active ? color.bg : "transparent", color: active ? color.tx : "#888", border: active ? "1px solid " + color.mid : "1px solid #ddd", fontWeight: active ? 500 : 400 }}>{children}</button>;
}
function BarChart({ data, labelKey, valueKey, colorFn, heightPx = 130, unit = "" }) {
  const maxV = Math.max(...data.map(d => Math.abs(d[valueKey])), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: heightPx }}>
        {data.map((d, i) => {
          const h = Math.max(2, (Math.abs(d[valueKey]) / maxV) * (heightPx - 20));
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
              <div style={{ fontSize: 9, color: "#888", marginBottom: 2 }}>{unit === "万" ? (d[valueKey] / 10000).toFixed(1) : d[valueKey]}</div>
              <div style={{ width: "75%", height: h, background: colorFn(d), borderRadius: 3 }} />
              <div style={{ fontSize: 10, color: "#888", marginTop: 3 }}>{d[labelKey]}</div>
            </div>
          );
        })}
      </div>
      {unit && <div style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 4 }}>{unit}</div>}
    </div>
  );
}

// ===== PAGE 1: DASHBOARD =====
function Dashboard({ students, monthData }) {
  const activeStudents = students.filter(s => s.remainHrs > 0);
  const totalRemainHrs = students.reduce((a, s) => a + (parseFloat(s.remainHrs) || 0), 0);
  const oldPkg = students.filter(s => s.pkgPrice === 2199);
  const newPkg = students.filter(s => s.pkgPrice === 2699);
  const lowHrs = activeStudents.filter(s => s.remainHrs <= 3 && s.remainHrs > 0);
  const prepaidLiability = students.reduce((a, s) => a + (parseFloat(s.remainHrs) || 0) * (s.pkgPrice === 2199 ? 219.9 : 269.9), 0);

  const filledMonths = MONTHS.map((_, i) => {
    const d = monthData[i];
    const rev = (parseFloat(d.pvtRevenue)||0)+(parseFloat(d.adultRevenue)||0)+(parseFloat(d.campRevenue)||0)+(parseFloat(d.tableRevenue)||0);
    const cost = (parseFloat(d.coachCost)||0)+(parseFloat(d.rent)||0)+(parseFloat(d.misc)||0);
    return { rev, cost, profit: rev - cost, hasData: rev > 0 || cost > 0 };
  });
  const filled = filledMonths.filter(d => d.hasData);
  const cumProfit = filled.reduce((a, d) => a + d.profit, 0);

  return (
    <div>
      <Sec title="经营总览">
        <G cols={4}>
          <Metric label="总学员数" value={students.length + "人"} sub={`活跃 ${activeStudents.length} / 课时耗尽 ${students.length - activeStudents.length}`} />
          <Metric label="总剩余课时" value={Math.round(totalRemainHrs) + "h"} color={C.amber.mid} sub={`预收负债 ${fmt(prepaidLiability)}`} />
          <Metric label="即将续费（≤3h）" value={lowHrs.length + "人"} color={lowHrs.length > 3 ? C.red.mid : C.amber.mid} />
          <Metric label="本年累计利润" value={fmt(cumProfit)} color={cumProfit >= 0 ? C.green.mid : C.red.mid} sub={`${filled.length}个月数据`} />
        </G>
      </Sec>
      <Sec title="套餐结构">
        <G cols={2}>
          <div style={{ background: C.amber.bg, borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, color: C.amber.tx }}>老套餐 ¥2,199/10h</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: C.amber.tx }}>{oldPkg.length}人</div>
            <div style={{ fontSize: 11, color: C.amber.tx, marginTop: 4 }}>剩余 {Math.round(oldPkg.reduce((a, s) => a + (parseFloat(s.remainHrs)||0), 0))}h</div>
          </div>
          <div style={{ background: C.teal.bg, borderRadius: 8, padding: 12 }}>
            <div style={{ fontSize: 12, color: C.teal.tx }}>新套餐 ¥2,699/10h</div>
            <div style={{ fontSize: 20, fontWeight: 500, color: C.teal.tx }}>{newPkg.length}人</div>
            <div style={{ fontSize: 11, color: C.teal.tx, marginTop: 4 }}>剩余 {Math.round(newPkg.reduce((a, s) => a + (parseFloat(s.remainHrs)||0), 0))}h</div>
          </div>
        </G>
      </Sec>
      {lowHrs.length > 0 && (
        <Sec title="续费预警（剩余≤3小时）">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {lowHrs.map((s, i) => (
              <div key={i} style={{ background: C.red.bg, borderRadius: 6, padding: "6px 10px", fontSize: 12, color: C.red.tx }}>{s.name} <span style={{ fontWeight: 500 }}>{s.remainHrs}h</span></div>
            ))}
          </div>
        </Sec>
      )}
      {filled.length > 0 && (
        <Sec title="月度利润走势">
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 120 }}>
            {filledMonths.map((d, i) => {
              const maxV = Math.max(...filledMonths.map(x => Math.max(Math.abs(x.profit), 1)));
              const h = d.hasData ? Math.max(2, (Math.abs(d.profit) / maxV) * 100) : 0;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                  {d.hasData && <div style={{ fontSize: 8, color: d.profit >= 0 ? C.green.mid : C.red.mid, marginBottom: 2 }}>{(d.profit/10000).toFixed(1)}</div>}
                  <div style={{ width: "70%", height: h || 2, background: d.hasData ? (d.profit >= 0 ? C.teal.mid : C.red.mid) : "#e8e8e4", borderRadius: 2 }} />
                  <div style={{ fontSize: 9, color: "#888", marginTop: 3 }}>{MONTHS[i]}</div>
                </div>
              );
            })}
          </div>
        </Sec>
      )}
    </div>
  );
}

// ===== PAGE 2: STUDENTS =====
function Students({ students, setStudents }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPkg, setNewPkg] = useState(2699);
  const [newHrs, setNewHrs] = useState("10");
  const [newFreq, setNewFreq] = useState("2");
  const [newType, setNewType] = useState("active");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);

  const filtered = useMemo(() => {
    let list = students;
    if (search) list = list.filter(s => s.name.includes(search));
    if (filter === "active") list = list.filter(s => s.remainHrs > 0);
    if (filter === "low") list = list.filter(s => s.remainHrs > 0 && s.remainHrs <= 3);
    if (filter === "expired") list = list.filter(s => s.remainHrs <= 0);
    if (filter === "old") list = list.filter(s => s.pkgPrice === 2199);
    if (filter === "new") list = list.filter(s => s.pkgPrice === 2699);
    return list;
  }, [students, search, filter]);

  const addStudent = () => {
    if (!newName.trim()) return;
    setStudents(prev => [...prev, { id: Date.now(), name: newName.trim(), pkgPrice: newPkg, remainHrs: parseFloat(newHrs) || 10, freq: parseInt(newFreq) || 2, type: newType }]);
    setNewName(""); setNewHrs("10"); setShowAdd(false);
  };
  const removeStudent = id => setStudents(prev => prev.filter(s => s.id !== id));
  const updateHrs = (id, hrs) => setStudents(prev => prev.map(s => s.id === id ? { ...s, remainHrs: parseFloat(hrs) || 0 } : s));

  const bulkImport = () => {
    const lines = bulkText.trim().split("\n").filter(l => l.trim());
    const newSt = lines.map((line, i) => {
      const parts = line.split(/[,\t，]/).map(s => s.trim());
      return { id: Date.now() + i, name: parts[0] || `学员${students.length + i + 1}`, pkgPrice: parts[2] && parts[2].includes("2199") ? 2199 : 2699, remainHrs: parseFloat(parts[1]) || 10, freq: parseInt(parts[3]) || 2, type: (parseInt(parts[3]) || 2) >= 2 ? "active" : "casual" };
    });
    setStudents(prev => [...prev, ...newSt]);
    setBulkText(""); setShowBulk(false);
  };

  return (
    <div>
      <Sec title="学员管理" right={<div style={{ display: "flex", gap: 4 }}><Btn small onClick={() => { setShowBulk(!showBulk); setShowAdd(false); }}>批量导入</Btn><Btn small active onClick={() => { setShowAdd(!showAdd); setShowBulk(false); }} color={C.green}>+ 添加学员</Btn></div>}>
        {showAdd && (
          <div style={{ background: C.green.bg, borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <G cols={3}>
              <Inp label="姓名" value={newName} onChange={setNewName} type="text" placeholder="学员姓名" />
              <div style={{ marginBottom: 8 }}><div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>套餐</div><div style={{ display: "flex", gap: 4 }}><Btn small active={newPkg === 2699} onClick={() => setNewPkg(2699)} color={C.teal}>¥2,699</Btn><Btn small active={newPkg === 2199} onClick={() => setNewPkg(2199)} color={C.amber}>¥2,199</Btn></div></div>
              <Inp label="剩余课时" value={newHrs} onChange={setNewHrs} suffix="h" />
            </G>
            <G cols={3}>
              <Inp label="每周频次" value={newFreq} onChange={setNewFreq} suffix="次" />
              <div style={{ marginBottom: 8 }}><div style={{ fontSize: 12, color: "#888", marginBottom: 3 }}>类型</div><div style={{ display: "flex", gap: 4 }}><Btn small active={newType === "active"} onClick={() => setNewType("active")} color={C.teal}>活跃</Btn><Btn small active={newType === "casual"} onClick={() => setNewType("casual")} color={C.blue}>一般</Btn></div></div>
              <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 8 }}><button onClick={addStudent} style={{ padding: "6px 20px", fontSize: 13, borderRadius: 6, background: C.green.mid, color: "white", border: "none", cursor: "pointer" }}>确认添加</button></div>
            </G>
          </div>
        )}
        {showBulk && (
          <div style={{ background: C.blue.bg, borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 12, color: C.blue.tx, marginBottom: 6 }}>每行一个学员，格式：姓名, 剩余课时, 套餐(2199或2699), 周频次</div>
            <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={5} placeholder={"张三, 8, 2699, 2\n李四, 3, 2199, 1"} style={{ width: "100%", fontSize: 13, padding: 8, borderRadius: 6, border: "1px solid #ccc", background: "transparent", color: "inherit", resize: "vertical" }} />
            <button onClick={bulkImport} style={{ marginTop: 8, padding: "6px 20px", fontSize: 13, borderRadius: 6, background: C.blue.mid, color: "white", border: "none", cursor: "pointer" }}>导入</button>
          </div>
        )}
      </Sec>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索学员..." style={{ flex: 1, minWidth: 120, fontSize: 13, padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "transparent", color: "inherit" }} />
        {[["all","全部"],["active","活跃"],["low","即将续费"],["expired","已耗尽"],["old","老套餐"],["new","新套餐"]].map(([k, v]) => (
          <Btn key={k} small active={filter === k} onClick={() => setFilter(k)}>{v}</Btn>
        ))}
      </div>
      <G cols={3}>
        <Metric label="总人数" value={students.length + "人"} />
        <Metric label="总剩余课时" value={Math.round(students.reduce((a, s) => a + (parseFloat(s.remainHrs)||0), 0)) + "h"} color={C.amber.mid} />
        <Metric label="预收款负债" value={fmt(students.reduce((a, s) => a + (parseFloat(s.remainHrs)||0) * (s.pkgPrice === 2199 ? 219.9 : 269.9), 0))} color={C.coral.mid} />
      </G>
      <div style={{ marginTop: 12, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ borderBottom: "1px solid #ddd" }}>
            {["姓名","套餐","剩余课时","周频次","预计续费","类型","操作"].map(h => <th key={h} style={{ padding: "6px 4px", textAlign: "left", fontWeight: 500, color: "#888", fontSize: 11 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {filtered.map(s => {
              const wl = s.freq > 0 ? s.remainHrs / s.freq : 999;
              const urgent = s.remainHrs <= 3 && s.remainHrs > 0;
              return (
                <tr key={s.id} style={{ borderBottom: "0.5px solid #eee", background: urgent ? C.red.bg : "transparent" }}>
                  <td style={{ padding: "6px 4px", fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: "6px 4px" }}><Pill text={s.pkgPrice === 2199 ? "¥2,199" : "¥2,699"} color={s.pkgPrice === 2199 ? C.amber : C.teal} /></td>
                  <td style={{ padding: "6px 4px" }}><input type="number" value={s.remainHrs} onChange={e => updateHrs(s.id, e.target.value)} style={{ width: 50, fontSize: 12, padding: "2px 4px", borderRadius: 4, border: "1px solid #ddd", background: "transparent", color: urgent ? C.red.mid : "inherit", fontWeight: urgent ? 500 : 400 }} />h</td>
                  <td style={{ padding: "6px 4px" }}>{s.freq}次/周</td>
                  <td style={{ padding: "6px 4px", color: wl <= 2 ? C.red.mid : wl <= 4 ? C.amber.mid : "#888" }}>{s.remainHrs <= 0 ? "已耗尽" : `${Math.round(wl)}周后`}</td>
                  <td style={{ padding: "6px 4px" }}><Pill text={s.type === "active" ? "活跃" : "一般"} color={s.type === "active" ? C.teal : C.blue} /></td>
                  <td style={{ padding: "6px 4px" }}><button onClick={() => removeStudent(s.id)} style={{ fontSize: 11, color: "#aaa", background: "none", border: "none", cursor: "pointer" }}>删除</button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#aaa", fontSize: 13 }}>暂无学员数据</div>}
      </div>
    </div>
  );
}

// ===== PAGE 3: V8 FINANCIAL MODEL (COMPLETE) =====
function FinModel() {
  const [pvtStudents, setPvtStudents] = useState(15);
  const [pvtFreq, setPvtFreq] = useState(2);
  const [activeRatio, setActiveRatio] = useState(60);
  const [newStudents, setNewStudents] = useState(4);
  const [campStudents, setCampStudents] = useState(8);
  const [campMonths, setCampMonths] = useState(3);
  const [adultStudents, setAdultStudents] = useState(8);
  const [adultFreq, setAdultFreq] = useState(2);
  const [bossPct, setBossPct] = useState(50);
  const [rent, setRent] = useState(10000);
  const [reno, setReno] = useState(100000);
  const [misc, setMisc] = useState(3000);
  const [renewRate, setRenewRate] = useState(80);
  const [tableRentHrs, setTableRentHrs] = useState(20);
  const [memberHrs, setMemberHrs] = useState(15);

  const model = useMemo(() => {
    const CW = 130, PKG = 2699, PKG_H = 10, HR = 269.9;
    const CAMP_R = 260, CAMP_DW = 5, ADULT_R = 150;
    const TR = 30, MR_RATE = 20, W = 4.33;

    const actRat = activeRatio / 100;
    const actF = pvtFreq, casF = Math.max(1, pvtFreq - 1);
    const br = bossPct / 100;
    const rr = renewRate / 100;
    const actPkgMo = (PKG_H / actF) / W;
    const casPkgMo = (PKG_H / casF) / W;

    const initAct = Math.round(pvtStudents * actRat);
    const initCas = pvtStudents - initAct;

    const campGrp = Math.ceil(campStudents / 4);
    const campHW = campGrp * 3 * CAMP_DW;
    const adultSW = Math.ceil(adultStudents / 4) * adultFreq;
    const adultHW = adultSW * 1.5;
    const adultRevMo = adultStudents * adultFreq * ADULT_R * W;
    const tableRevMo = tableRentHrs * TR * W;
    const memberRevMo = memberHrs * MR_RATE * W;
    const campRevMo = campStudents * CAMP_R * CAMP_DW * W;

    const firstPre = pvtStudents * PKG;
    const totalInv = rent * 3 + reno;

    const batches = [{ mo: 0, act: initAct, cas: initCas }];
    const monthly = [];
    let cumCash = 0, cumProf = 0, beMo = null;
    let prepaidBal = firstPre;

    for (let mo = 1; mo <= 12; mo++) {
      const isCamp = (mo === 1 || mo === 2 || mo === 7 || mo === 8) && campMonths > 0;
      const newAct = Math.round(newStudents * actRat);
      const newCas = newStudents - newAct;
      if (newStudents > 0) batches.push({ mo, act: newAct, cas: newCas });

      let totalAct = 0, totalCas = 0;
      for (const b of batches) { if (b.mo <= mo) { totalAct += b.act; totalCas += b.cas; } }
      const totalSt = totalAct + totalCas;

      const pvtHW = totalAct * actF + totalCas * casF;
      const normHW = pvtHW + adultHW;
      const fullHW = normHW + campHW;
      const teachHW = isCamp ? fullHW : normHW;
      const coachHW = teachHW * (1 - br);
      const coachCost = coachHW * CW * W;

      const pvtConfirmed = pvtHW * HR * W;
      const adultConf = adultRevMo;
      const tableConf = tableRevMo;
      const memberConf = memberRevMo;
      const campConf = isCamp ? campRevMo : 0;
      const moRevenue = pvtConfirmed + adultConf + tableConf + memberConf + campConf;

      const newPrepaidCashIn = newStudents * PKG;
      let renewCash = 0, renewCount = 0;
      for (const b of batches) {
        const age = mo - b.mo;
        if (age > 0) {
          if (b.act > 0 && age % Math.max(1, Math.round(actPkgMo)) === 0) {
            const n = Math.round(b.act * rr); renewCash += n * PKG; renewCount += n;
          }
          if (b.cas > 0 && age % Math.max(1, Math.round(casPkgMo)) === 0) {
            const n = Math.round(b.cas * rr); renewCash += n * PKG; renewCount += n;
          }
        }
      }

      const nonPrepaidCashIn = adultConf + tableConf + memberConf + campConf;
      const totalCashIn = newPrepaidCashIn + renewCash + nonPrepaidCashIn;
      const totalCashOut = rent + coachCost + misc;
      const netCash = totalCashIn - totalCashOut;

      prepaidBal = prepaidBal + newPrepaidCashIn + renewCash - pvtConfirmed;
      if (prepaidBal < 0) prepaidBal = 0;

      const moCost = rent + coachCost + misc;
      const moProfit = moRevenue - moCost;

      cumCash += netCash;
      cumProf += moProfit;
      if (beMo === null && cumProf >= totalInv) beMo = mo;

      const resTotal = coachCost + rent + misc;

      monthly.push({
        month: mo, isCamp, totalStudents: totalSt,
        revenue: Math.round(moRevenue), cost: Math.round(moCost), profit: Math.round(moProfit), cumProfit: Math.round(cumProf),
        newCashIn: Math.round(newPrepaidCashIn), renewCashIn: Math.round(renewCash), renewCount,
        cashIn: Math.round(totalCashIn), cashOut: Math.round(totalCashOut),
        netCash: Math.round(netCash), cumCash: Math.round(cumCash),
        reserveWage: Math.round(coachCost), reserveTotal: Math.round(resTotal),
        freeCash: Math.round(cumCash - resTotal),
        prepaidBal: Math.round(prepaidBal),
        pvtRev: Math.round(pvtConfirmed), campRev: Math.round(campConf),
        adultRev: Math.round(adultConf), tableRev: Math.round(tableConf + memberConf),
        bossH: Math.round(teachHW * br), coachH: Math.round(coachHW),
      });
    }

    const yrRev = monthly.reduce((a, x) => a + x.revenue, 0);
    const yrCost = monthly.reduce((a, x) => a + x.cost, 0);
    const yrProf = yrRev - yrCost;
    if (beMo === null && yrProf > 0) {
      beMo = Math.ceil(totalInv / (yrProf / 12));
      if (beMo > 36) beMo = null;
    }

    const initPvtHW = initAct * actF + initCas * casF;
    const initNormHW = initPvtHW + adultHW;
    const initCampTHW = initNormHW + campHW;
    const pvtRM0 = initPvtHW * HR * W;
    const coachCN0 = initNormHW * (1 - br) * CW * W;
    const coachCC0 = initCampTHW * (1 - br) * CW * W;

    return {
      initAct, initCas, actF, casF, actPkgMo, casPkgMo,
      initNormHW, initCampTHW,
      bossHN: Math.round(initNormHW * br), coachHN: Math.round(initNormHW * (1 - br)),
      coachCN0, coachCC0,
      pvtRM0, campRevMo, adultRevMo, tableRevMo, memberRevMo, newRM: newStudents * PKG,
      firstPre, totalInv,
      monthly, yrRev, yrCost, yrProf, beMo,
    };
  }, [pvtStudents, pvtFreq, activeRatio, newStudents, campStudents, campMonths, adultStudents, adultFreq, bossPct, rent, reno, misc, renewRate, tableRentHrs, memberHrs]);

  const md = model;
  const maxRev = Math.max(md.pvtRM0, md.campRevMo, md.adultRevMo, md.tableRevMo, md.memberRevMo, md.newRM, 1);
  const [tab, setTab] = useState(0);
  const tabs = ["参数设置", "收支总览", "预收款与现金流", "月度明细", "全年利润"];

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {tabs.map((t, i) => <Btn key={i} small active={tab === i} onClick={() => setTab(i)}>{t}</Btn>)}
      </div>

      {tab === 0 && (
        <div>
          <Sec title="1对1私教（¥2,699/10小时套餐）">
            <G><Sl label="初始学员数" value={pvtStudents} onChange={setPvtStudents} min={1} max={40} suffix="人" /><Sl label="基准频次（活跃用户）" value={pvtFreq} onChange={setPvtFreq} min={1} max={5} suffix="次/周" /></G>
            <G><Sl label="活跃用户比例" value={activeRatio} onChange={setActiveRatio} min={10} max={100} step={5} suffix="%" /><Sl label="每月新增学员" value={newStudents} onChange={setNewStudents} min={0} max={10} suffix="人" /></G>
            <div style={{ fontSize: 12, background: C.teal.bg, padding: "8px 10px", borderRadius: 6, color: C.teal.tx }}>
              初始：活跃 {md.initAct}人×{md.actF}次/周 + 一般 {md.initCas}人×{md.casF}次/周 | 套餐周期：活跃 {md.actPkgMo.toFixed(1)}月 / 一般 {md.casPkgMo.toFixed(1)}月
            </div>
          </Sec>
          <Sec title="寒暑假集训（¥260/天，周一至周五）">
            <G><Sl label="集训学员" value={campStudents} onChange={setCampStudents} min={0} max={24} suffix="人" /><Sl label="集训月数/年" value={campMonths} onChange={setCampMonths} min={0} max={4} suffix="月" /></G>
          </Sec>
          <Sec title="成人小班课（¥150/1.5h）">
            <G><Sl label="学员数" value={adultStudents} onChange={setAdultStudents} min={0} max={20} suffix="人" /><Sl label="每人每周" value={adultFreq} onChange={setAdultFreq} min={1} max={3} suffix="次" /></G>
          </Sec>
          <Sec title="球台租赁">
            <G><Sl label="散客租台/周（¥30/h）" value={tableRentHrs} onChange={setTableRentHrs} min={0} max={60} suffix="h" /><Sl label="会员租台/周（¥20/h）" value={memberHrs} onChange={setMemberHrs} min={0} max={60} suffix="h" /></G>
          </Sec>
          <Sec title="运营参数">
            <G><Sl label="老板带课比例" value={bossPct} onChange={setBossPct} min={0} max={100} step={5} suffix="%" /><Sl label="续费率" value={renewRate} onChange={setRenewRate} min={30} max={100} step={5} suffix="%" /></G>
            <G><Sl label="月租金" value={rent} onChange={setRent} min={5000} max={25000} step={1000} /><Sl label="装修投入" value={reno} onChange={setReno} min={50000} max={200000} step={10000} /></G>
            <Sl label="月杂费（水电等）" value={misc} onChange={setMisc} min={1000} max={10000} step={500} />
          </Sec>
        </div>
      )}

      {tab === 1 && (
        <div>
          <Sec title="月度确认收入构成（第1个月基准）">
            <BarVis label="1对1消课" value={md.pvtRM0} max={maxRev} color={C.teal.mid} />
            <BarVis label="成人小班" value={md.adultRevMo} max={maxRev} color={C.coral.mid} />
            <BarVis label="散客租台" value={md.tableRevMo} max={maxRev} color={C.blue.mid} />
            <BarVis label="会员租台" value={md.memberRevMo} max={maxRev} color={C.purple.mid} />
            <div style={{ marginTop: 8 }}><BarVis label="集训月额外" value={md.campRevMo} max={maxRev} color={C.amber.mid} /></div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 4 }}>确认收入 = 实际消课/服务后确认，不含预收款</div>
          </Sec>
          <Sec title="老板 vs 教练（初始月）">
            <G cols={3}>
              <Metric label="平时周总课时" value={Math.round(md.initNormHW) + "h"} />
              <Metric label="老板/周" value={md.bossHN + "h"} color={C.purple.mid} />
              <Metric label="教练/周" value={md.coachHN + "h"} color={C.teal.mid} />
            </G>
            <div style={{ marginTop: 10 }}>
              <MiniBar segments={[{ value: md.bossHN, color: C.purple.mid }, { value: md.coachHN, color: C.teal.mid }]} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginTop: 4 }}><span>老板 {pct(bossPct / 100)}</span><span>教练 {pct(1 - bossPct / 100)}</span></div>
            </div>
            <div style={{ marginTop: 12 }}><G cols={2}><Metric label="教练月薪（平时）" value={fmt(md.coachCN0)} /><Metric label="教练月薪（集训月）" value={fmt(md.coachCC0)} /></G></div>
          </Sec>
          <Sec title="每月工作量变化（老板 vs 教练，周课时）">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 150 }}>
              {md.monthly.map((mo, i) => {
                const total = mo.bossH + mo.coachH;
                const maxH = Math.max(...md.monthly.map(x => x.bossH + x.coachH), 1);
                const h = Math.max(4, (total / maxH) * 120);
                const bH = total > 0 ? (mo.bossH / total) * h : 0;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: 9, color: "#888", marginBottom: 2 }}>{total}</div>
                    <div style={{ width: "75%", display: "flex", flexDirection: "column", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: bH, background: C.purple.mid }} />
                      <div style={{ height: h - bH, background: C.teal.mid }} />
                    </div>
                    <div style={{ fontSize: 10, color: mo.isCamp ? C.blue.mid : "#888", marginTop: 3, fontWeight: mo.isCamp ? 500 : 400 }}>{mo.month}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 11, color: "#888" }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.purple.mid, marginRight: 4, verticalAlign: "middle" }} />老板</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.teal.mid, marginRight: 4, verticalAlign: "middle" }} />教练</span>
            </div>
          </Sec>
          <Sec title="月度利润变化（确认收入 - 成本）">
            <BarChart data={md.monthly} labelKey="month" valueKey="profit" colorFn={d => d.profit >= 0 ? (d.isCamp ? C.blue.mid : C.teal.mid) : C.red.mid} heightPx={120} unit="万" />
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 11, color: "#888" }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.teal.mid, marginRight: 4, verticalAlign: "middle" }} />平时月</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.blue.mid, marginRight: 4, verticalAlign: "middle" }} />集训月</span>
            </div>
          </Sec>
        </div>
      )}

      {tab === 2 && (
        <div>
          <Sec title="预收款概览">
            <G cols={3}>
              <Metric label="首批预收（开业）" value={fmt(md.firstPre)} color={C.green.mid} />
              <Metric label="每月新学员预收" value={fmt(newStudents * 2699)} color={C.teal.mid} />
              <Metric label="初始投入" value={fmt(md.totalInv)} />
            </G>
            <div style={{ fontSize: 11, color: "#888", marginTop: 8 }}>预收款 = 学员预付套餐费（尚未消课），随消课逐步转为确认收入。</div>
          </Sec>
          <Sec title="消课周期与续费节奏">
            <G cols={2}>
              <div style={{ background: C.teal.bg, borderRadius: 8, padding: 12 }}><div style={{ fontSize: 12, color: C.teal.tx }}>活跃 ({md.initAct}人 × {md.actF}次/周)</div><div style={{ fontSize: 18, fontWeight: 500, color: C.teal.tx }}>{md.actPkgMo.toFixed(1)}个月消完 → 续费</div></div>
              <div style={{ background: C.blue.bg, borderRadius: 8, padding: 12 }}><div style={{ fontSize: 12, color: C.blue.tx }}>一般 ({md.initCas}人 × {md.casF}次/周)</div><div style={{ fontSize: 18, fontWeight: 500, color: C.blue.tx }}>{md.casPkgMo.toFixed(1)}个月消完 → 续费</div></div>
            </G>
          </Sec>
          <Sec title="每月续费入账">
            <BarChart data={md.monthly} labelKey="month" valueKey="renewCashIn" colorFn={d => d.renewCashIn > 0 ? C.teal.mid : "#ddd"} heightPx={110} unit="万" />
          </Sec>
          <Sec title="预收款余额（负债）">
            <BarChart data={md.monthly} labelKey="month" valueKey="prepaidBal" colorFn={() => C.amber.mid} heightPx={100} unit="万" />
          </Sec>
          <Sec title="每月实际现金流入 vs 流出">
            <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 140 }}>
              {md.monthly.map((mo, i) => {
                const maxV = Math.max(...md.monthly.map(x => Math.max(x.cashIn, x.cashOut)), 1);
                const hIn = Math.max(2, (mo.cashIn / maxV) * 110);
                const hOut = Math.max(2, (mo.cashOut / maxV) * 110);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 1 }}>
                    <div style={{ fontSize: 8, color: "#888" }}>{Math.round(mo.netCash / 1000)}k</div>
                    <div style={{ display: "flex", gap: 1, alignItems: "flex-end" }}>
                      <div style={{ width: 12, height: hIn, background: C.teal.mid, borderRadius: 2 }} />
                      <div style={{ width: 12, height: hOut, background: C.red.mid, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{mo.month}</div>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 11, color: "#888" }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.teal.mid, marginRight: 4, verticalAlign: "middle" }} />现金流入</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.red.mid, marginRight: 4, verticalAlign: "middle" }} />现金流出</span>
            </div>
          </Sec>
        </div>
      )}

      {tab === 3 && (
        <div>
          <Sec title="月度明细（现金口径）">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11, minWidth: 780 }}>
                <thead><tr style={{ borderBottom: "1px solid #ddd" }}>
                  {["月","","学员","确认收入","成本","利润","新学员预收","续费预收","现金流入","现金流出","净现金","累计现金","预留","可用"].map(h => (
                    <th key={h} style={{ padding: "5px 2px", textAlign: "right", fontWeight: 500, color: "#888", fontSize: 10, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {md.monthly.map((mo, i) => (
                    <tr key={i} style={{ borderBottom: "0.5px solid #eee", background: mo.isCamp ? C.blue.bg : "transparent" }}>
                      <td style={{ padding: "4px 2px", textAlign: "right" }}>{mo.month}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right" }}>{mo.isCamp ? <Pill text="集训" color={C.blue} /> : <span style={{ fontSize: 9, color: "#aaa" }}>平时</span>}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", color: C.teal.mid }}>{mo.totalStudents}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right" }}>{fmt(mo.revenue)}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", color: C.red.mid }}>{fmt(mo.cost)}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", color: mo.profit >= 0 ? C.green.mid : C.red.mid, fontWeight: 500 }}>{fmt(mo.profit)}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", color: mo.newCashIn > 0 ? C.green.mid : "#ccc" }}>{mo.newCashIn > 0 ? fmt(mo.newCashIn) : "-"}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", color: mo.renewCashIn > 0 ? C.teal.mid : "#ccc" }}>{mo.renewCashIn > 0 ? fmt(mo.renewCashIn) + "(" + mo.renewCount + "人)" : "-"}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", color: C.teal.mid }}>{fmt(mo.cashIn)}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", color: C.red.mid }}>{fmt(mo.cashOut)}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", fontWeight: 500, color: mo.netCash >= 0 ? C.green.mid : C.red.mid }}>{fmt(mo.netCash)}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", fontWeight: 500 }}>{fmt(mo.cumCash)}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", color: C.amber.mid }}>{fmt(mo.reserveTotal)}</td>
                      <td style={{ padding: "4px 2px", textAlign: "right", fontWeight: 500, color: mo.freeCash >= 0 ? C.green.mid : C.red.mid }}>{fmt(mo.freeCash)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ fontSize: 11, color: "#888", marginTop: 8, lineHeight: 1.8 }}>
              确认收入 = 已消课/已服务金额（权责发生制）<br/>
              现金流入 = 新学员预收 + 续费预收 + 成人小班 + 租台 + 集训（收付实现制）<br/>
              预留 = 下月教练工资+房租+杂费 | 可用 = 累计现金 - 预留
            </div>
          </Sec>
          <Sec title="累计现金趋势">
            <BarChart data={md.monthly} labelKey="month" valueKey="cumCash" colorFn={d => d.cumCash >= 0 ? C.teal.mid : C.red.mid} heightPx={130} unit="万" />
          </Sec>
        </div>
      )}

      {tab === 4 && (
        <div>
          <Sec title="全年利润汇总（权责发生制）">
            <G cols={3}>
              <Metric label="全年确认收入" value={fmt(md.yrRev)} color={C.teal.mid} />
              <Metric label="全年总成本" value={fmt(md.yrCost)} color={C.coral.mid} />
              <Metric label="全年净利润" value={fmt(md.yrProf)} color={md.yrProf >= 0 ? C.green.mid : C.red.mid} />
            </G>
            <div style={{ marginTop: 12 }}><G cols={3}>
              <Metric label="初始投入" value={fmt(md.totalInv)} />
              <Metric label="回本周期" value={md.beMo ? md.beMo + "个月" : ">36个月"} color={C.blue.mid} />
              <Metric label="年化ROI" value={md.totalInv > 0 ? Math.round(md.yrProf / md.totalInv * 100) + "%" : "-"} color={md.yrProf >= 0 ? C.green.mid : C.red.mid} />
            </G></div>
          </Sec>
          <Sec title="月度利润走势">
            <BarChart data={md.monthly} labelKey="month" valueKey="profit" colorFn={d => d.profit >= 0 ? (d.isCamp ? C.blue.mid : C.teal.mid) : C.red.mid} heightPx={130} unit="万" />
            <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 8, fontSize: 11, color: "#888" }}>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.teal.mid, marginRight: 4, verticalAlign: "middle" }} />平时月</span>
              <span><span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 2, background: C.blue.mid, marginRight: 4, verticalAlign: "middle" }} />集训月</span>
            </div>
          </Sec>
          <Sec title="确认收入来源年度占比">
            {(() => {
              const pvtYr = md.monthly.reduce((a, x) => a + x.pvtRev, 0);
              const campYr = md.monthly.reduce((a, x) => a + x.campRev, 0);
              const adultYr = md.monthly.reduce((a, x) => a + x.adultRev, 0);
              const tableYr = md.monthly.reduce((a, x) => a + x.tableRev, 0);
              const items = [
                { label: "1对1消课", value: pvtYr, color: C.teal.mid },
                { label: "集训", value: campYr, color: C.amber.mid },
                { label: "成人小班", value: adultYr, color: C.coral.mid },
                { label: "球台租赁", value: tableYr, color: C.blue.mid },
              ];
              const total = items.reduce((a, x) => a + x.value, 0) || 1;
              return (<><MiniBar segments={items} height={22} /><div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>{items.map((it, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: it.color, display: "inline-block" }} /><span style={{ color: "#888" }}>{it.label} {Math.round(it.value / total * 100)}% ({fmt(it.value)})</span></div>))}</div></>);
            })()}
          </Sec>
          <Sec title="成本结构年度占比">
            {(() => {
              const coachYr = md.monthly.reduce((a, x) => a + x.reserveWage, 0);
              const items = [
                { label: "房租", value: rent * 12, color: C.red.mid },
                { label: "教练工资", value: coachYr, color: C.pink.mid },
                { label: "水电杂费", value: misc * 12, color: C.gray.mid },
              ];
              const total = items.reduce((a, x) => a + x.value, 0) || 1;
              return (<><MiniBar segments={items} height={22} /><div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 8 }}>{items.map((it, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: it.color, display: "inline-block" }} /><span style={{ color: "#888" }}>{it.label} {Math.round(it.value / total * 100)}% ({fmt(it.value)})</span></div>))}</div></>);
            })()}
          </Sec>
        </div>
      )}
    </div>
  );
}

// ===== PAGE 4: KPI TRACKER =====
function KPITracker({ monthData, setMonthData, targets, setTargets, students }) {
  const [selMonth, setSelMonth] = useState(0);
  const [sub, setSub] = useState(0);
  const subs = ["目标设定", "月度录入", "达标分析"];
  const act = monthData[selMonth];
  const setAct = (f, v) => setMonthData(prev => ({ ...prev, [selMonth]: { ...prev[selMonth], [f]: v } }));
  const isCamp = selMonth === 0 || selMonth === 1 || selMonth === 6 || selMonth === 7;

  const actualTotal = (parseFloat(act.pvtRevenue)||0)+(parseFloat(act.adultRevenue)||0)+(parseFloat(act.campRevenue)||0)+(parseFloat(act.tableRevenue)||0);
  const actualCost = (parseFloat(act.coachCost)||0)+(parseFloat(act.rent)||0)+(parseFloat(act.misc)||0);
  const actualProfit = actualTotal - actualCost;
  const targetTotal = targets.pvtRevenue + targets.adultRevenue + (isCamp ? targets.campRevenue : 0) + targets.tableRevenue;
  const prevTotal = selMonth > 0 ? (parseFloat(monthData[selMonth - 1].totalStudents)||0) : students.length;
  const renewals = parseFloat(act.renewals)||0;
  const dueRenew = prevTotal || students.length;
  const actualRR = dueRenew > 0 ? Math.round((renewals / dueRenew) * 100) : 0;

  return (
    <div>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {subs.map((s, i) => <Btn key={i} small active={sub === i} onClick={() => setSub(i)}>{s}</Btn>)}
      </div>
      {sub >= 1 && (
        <div style={{ display: "flex", gap: 3, marginBottom: 12, flexWrap: "wrap" }}>
          {MONTHS.map((m, i) => {
            const d = monthData[i]; const has = (parseFloat(d.pvtRevenue)||0) > 0;
            return <Btn key={i} small active={selMonth === i} onClick={() => setSelMonth(i)} color={has && selMonth !== i ? C.green : C.blue}>{m}</Btn>;
          })}
        </div>
      )}
      {sub === 0 && (
        <Sec title="月度目标设定">
          <G><Inp label="新增学员目标" value={targets.newStudents} onChange={v => setTargets(p => ({...p, newStudents: +v}))} suffix="人" /><Inp label="续费率目标" value={targets.renewRate} onChange={v => setTargets(p => ({...p, renewRate: +v}))} suffix="%" /></G>
          <G><Inp label="私教消课收入" value={targets.pvtRevenue} onChange={v => setTargets(p => ({...p, pvtRevenue: +v}))} prefix="¥" /><Inp label="成人小班收入" value={targets.adultRevenue} onChange={v => setTargets(p => ({...p, adultRevenue: +v}))} prefix="¥" /></G>
          <G><Inp label="集训收入（集训月）" value={targets.campRevenue} onChange={v => setTargets(p => ({...p, campRevenue: +v}))} prefix="¥" /><Inp label="球台租赁收入" value={targets.tableRevenue} onChange={v => setTargets(p => ({...p, tableRevenue: +v}))} prefix="¥" /></G>
          <Inp label="月成本上限" value={targets.totalCost} onChange={v => setTargets(p => ({...p, totalCost: +v}))} prefix="¥" />
        </Sec>
      )}
      {sub === 1 && (
        <div>
          <Sec title={MONTHS[selMonth] + " 实际数据"} sub={isCamp ? "集训月" : "平时月"}>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 8 }}>学员</div>
            <G cols={4}>
              <Inp label="新增" value={act.newStudents} onChange={v => setAct("newStudents", v)} suffix="人" />
              <Inp label="续费" value={act.renewals} onChange={v => setAct("renewals", v)} suffix="人" />
              <Inp label="流失" value={act.lostStudents} onChange={v => setAct("lostStudents", v)} suffix="人" />
              <Inp label="月末总数" value={act.totalStudents} onChange={v => setAct("totalStudents", v)} suffix="人" />
            </G>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 8, marginTop: 8 }}>收入</div>
            <G cols={2}><Inp label="私教消课" value={act.pvtRevenue} onChange={v => setAct("pvtRevenue", v)} prefix="¥" /><Inp label="成人小班" value={act.adultRevenue} onChange={v => setAct("adultRevenue", v)} prefix="¥" /></G>
            <G cols={2}><Inp label="集训" value={act.campRevenue} onChange={v => setAct("campRevenue", v)} prefix="¥" /><Inp label="球台租赁" value={act.tableRevenue} onChange={v => setAct("tableRevenue", v)} prefix="¥" /></G>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#666", marginBottom: 8, marginTop: 8 }}>支出</div>
            <G cols={3}><Inp label="教练工资" value={act.coachCost} onChange={v => setAct("coachCost", v)} prefix="¥" /><Inp label="房租" value={act.rent} onChange={v => setAct("rent", v)} prefix="¥" /><Inp label="杂费" value={act.misc} onChange={v => setAct("misc", v)} prefix="¥" /></G>
          </Sec>
          <div style={{ background: actualProfit >= 0 ? C.green.bg : C.red.bg, borderRadius: 8, padding: 12, display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 13, color: actualProfit >= 0 ? C.green.tx : C.red.tx }}>本月利润</span>
            <span style={{ fontSize: 20, fontWeight: 500, color: actualProfit >= 0 ? C.green.mid : C.red.mid }}>{fmt(actualProfit)}</span>
          </div>
        </div>
      )}
      {sub === 2 && (
        <div>
          <Sec title={MONTHS[selMonth] + " 达标分析"}>
            <G cols={3}>
              <KPICard label="新增学员" target={targets.newStudents} actual={act.newStudents} unit="人" />
              <KPICard label="续费率" target={targets.renewRate} actual={actualRR} unit="%" />
              <KPICard label="流失" target={2} actual={act.lostStudents} unit="人" invert />
            </G>
            <div style={{ marginTop: 10 }}><G cols={2}>
              <KPICard label="私教消课" target={targets.pvtRevenue} actual={act.pvtRevenue} format="money" />
              <KPICard label="成人小班" target={targets.adultRevenue} actual={act.adultRevenue} format="money" />
            </G></div>
            <div style={{ marginTop: 10 }}><G cols={2}>
              <KPICard label="集训" target={isCamp ? targets.campRevenue : 0} actual={act.campRevenue} format="money" />
              <KPICard label="球台租赁" target={targets.tableRevenue} actual={act.tableRevenue} format="money" />
            </G></div>
            <div style={{ marginTop: 10 }}><G cols={3}>
              <KPICard label="总收入" target={targetTotal} actual={actualTotal} format="money" />
              <KPICard label="总成本" target={targets.totalCost} actual={actualCost} format="money" invert />
              <KPICard label="净利润" target={targetTotal - targets.totalCost} actual={actualProfit} format="money" />
            </G></div>
          </Sec>
          {actualTotal > 0 && (
            <Sec title="诊断">
              {(() => {
                const issues = [];
                const pvtP = targets.pvtRevenue > 0 ? ((parseFloat(act.pvtRevenue)||0) / targets.pvtRevenue * 100) : 100;
                const newP = targets.newStudents > 0 ? ((parseFloat(act.newStudents)||0) / targets.newStudents * 100) : 100;
                const costP = targets.totalCost > 0 ? (actualCost / targets.totalCost * 100) : 100;
                if (newP < 80) issues.push({ t: `招生完成${Math.round(newP)}%，加强微信推广/转介绍/体验课`, c: C.red });
                if (actualRR < targets.renewRate && dueRenew > 0) issues.push({ t: `续费率${actualRR}%低于${targets.renewRate}%目标，跟进到期学员`, c: C.red });
                if (pvtP < 80) issues.push({ t: `私教收入达标${Math.round(pvtP)}%，检查出勤率`, c: C.amber });
                if (costP > 110) issues.push({ t: `成本超预算${Math.round(costP - 100)}%`, c: C.red });
                if (issues.length === 0) issues.push({ t: "各项指标达标，继续保持！", c: C.green });
                return issues.map((iss, i) => <div key={i} style={{ background: iss.c.bg, borderRadius: 6, padding: "8px 10px", marginBottom: 6, fontSize: 13, color: iss.c.tx }}>{iss.t}</div>);
              })()}
            </Sec>
          )}
        </div>
      )}
    </div>
  );
}

// ===== MAIN APP WITH LOCALSTORAGE =====
const emptyMonth = () => ({ newStudents: "", renewals: "", totalStudents: "", lostStudents: "", pvtRevenue: "", adultRevenue: "", campRevenue: "", tableRevenue: "", coachCost: "", rent: "", misc: "" });

function loadLS(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export default function App() {
  const [page, setPage] = useState(0);
  const pages = [
    { name: "仪表盘", icon: "◉" },
    { name: "学员管理", icon: "◎" },
    { name: "财务模型", icon: "◈" },
    { name: "KPI追踪", icon: "◆" },
  ];

  const [students, setStudentsRaw] = useState(() => loadLS("pp_students", [
    { id: 1, name: "示例-张三", pkgPrice: 2699, remainHrs: 8, freq: 2, type: "active" },
    { id: 2, name: "示例-李四", pkgPrice: 2199, remainHrs: 2, freq: 1, type: "casual" },
    { id: 3, name: "示例-王五", pkgPrice: 2699, remainHrs: 10, freq: 3, type: "active" },
  ]));
  const setStudents = useCallback((v) => { setStudentsRaw(prev => { const next = typeof v === "function" ? v(prev) : v; saveLS("pp_students", next); return next; }); }, []);

  const [monthData, setMonthDataRaw] = useState(() => loadLS("pp_months", (() => { const d = {}; MONTHS.forEach((_, i) => { d[i] = emptyMonth(); }); return d; })()));
  const setMonthData = useCallback((v) => { setMonthDataRaw(prev => { const next = typeof v === "function" ? v(prev) : v; saveLS("pp_months", next); return next; }); }, []);

  const [targets, setTargetsRaw] = useState(() => loadLS("pp_targets", { newStudents: 4, renewRate: 80, pvtRevenue: 45000, adultRevenue: 4000, campRevenue: 17000, tableRevenue: 2200, totalCost: 16000 }));
  const setTargets = useCallback((v) => { setTargetsRaw(prev => { const next = typeof v === "function" ? v(prev) : v; saveLS("pp_targets", next); return next; }); }, []);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", maxWidth: 760, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "2px solid #eee" }}>
        {pages.map((p, i) => (
          <button key={i} onClick={() => setPage(i)} style={{
            padding: "10px 16px", fontSize: 14, cursor: "pointer", background: "none", border: "none",
            borderBottom: page === i ? "2px solid " + C.teal.mid : "2px solid transparent", marginBottom: -2,
            color: page === i ? C.teal.mid : "#888", fontWeight: page === i ? 500 : 400,
          }}>{p.icon} {p.name}</button>
        ))}
      </div>
      {page === 0 && <Dashboard students={students} monthData={monthData} />}
      {page === 1 && <Students students={students} setStudents={setStudents} />}
      {page === 2 && <FinModel />}
      {page === 3 && <KPITracker monthData={monthData} setMonthData={setMonthData} targets={targets} setTargets={setTargets} students={students} />}
    </div>
  );
}