/* 빅데이터 주제 실험실 — 집계 JSON을 읽어 지도·차트를 그린다 */
const $ = (s) => document.querySelector(s);
const fmt = (n) => Number(n).toLocaleString("ko-KR");
const pct = (x, d = 1) => (x * 100).toFixed(d) + "%";
const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const drawn = {};
const cache = {};

async function load(name) {
  if (cache[name] !== undefined) return cache[name];
  try {
    const r = await fetch(`data/${name}.json`, { cache: "no-cache" });
    cache[name] = r.ok ? await r.json() : null;
  } catch (e) { cache[name] = null; }
  return cache[name];
}

function kpis(el, items) {
  $(el).innerHTML = items.map(([v, t]) => `<div class="kpi"><b>${v}</b><span>${t}</span></div>`).join("");
}

function baseMap(id) {
  const m = L.map(id, { scrollWheelZoom: false }).setView([37.5565, 126.99], 11);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  }).addTo(m);
  return m;
}

function chart(id, cfg) {
  Chart.defaults.color = css("--mute");
  Chart.defaults.borderColor = css("--line");
  Chart.defaults.font.family = '"Pretendard","Apple SD Gothic Neo","Noto Sans KR",sans-serif';
  return new Chart(document.getElementById(id), cfg);
}

/* ---------------------------------------------------------------- T1 */
async function drawT1() {
  const d = await load("t1");
  if (!d) return;
  const s = d.summary, m = d.model, c = d.cohort;
  kpis("#t1-kpi", [
    [fmt(s.rows), "서울 음식점·카페 인허가 기록"],
    [fmt(s.status_counts["폐업"]), "그중 폐업 (생존분석의 ‘사건’)"],
    [pct(c["2015-2019"].S36[0]), "2015–2019 개업 가게의 3년 생존율"],
    [m.auc_test.toFixed(3), "3년 내 폐업 예측 AUC (2020년 이후 개업으로 검증)"],
  ]);
  $("#t1-xy").textContent = fmt(s.quality.xy_missing);
  const color = (r) => r < 0.3 ? "#1d4ed8" : r < 0.4 ? "#60a5fa" : r < 0.5 ? "#fbbf24" : r < 0.6 ? "#f97316" : "#dc2626";
  const map = baseMap("t1-map");
  d.cells.forEach(([la0, lo0, la1, lo1, n, r]) => {
    L.rectangle([[la0, lo0], [la1, lo1]], { color: color(r), weight: 0, fillOpacity: 0.55 })
      .bindTooltip(`500m 격자 · 개업 ${fmt(n)}곳 · 3년 내 폐업 ${pct(r)}`).addTo(map);
  });
  d.gu.forEach((g) => {
    L.circleMarker([g.lat, g.lon], { radius: 7, color: "#0f172a", weight: 1.5, fillColor: "#fff", fillOpacity: 0.9 })
      .bindTooltip(`<b>${g.gu}</b><br>2015–2022 개업 ${fmt(g.n)}곳<br>1년 생존 ${pct(g.S12)} · 3년 ${pct(g.S36)} · 5년 ${pct(g.S60)}`).addTo(map);
  });
  const pal = ["#94a3b8", "#60a5fa", "#2563eb", "#dc2626"];
  chart("t1-km", {
    type: "line",
    data: {
      labels: Array.from({ length: 121 }, (_, i) => i),
      datasets: Object.entries(d.curves).map(([k, v], i) => ({
        label: `${k} 개업 (n=${fmt(v.n)})`, data: v.S.slice(0, 121).map((y) => y * 100),
        borderColor: pal[i], pointRadius: 0, borderWidth: 2, tension: 0.1,
      })),
    },
    options: {
      maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
      scales: {
        x: { title: { display: true, text: "개업 후 개월 수" }, ticks: { callback: (v) => (v % 12 === 0 ? v : "") } },
        y: { min: 0, max: 100, title: { display: true, text: "영업 중인 비율 (%)" } },
      },
      plugins: { tooltip: { callbacks: { title: (t) => `${t[0].label}개월`, label: (t) => `${t.dataset.label}: ${t.parsed.y.toFixed(1)}%` } } },
    },
  });
  const ut = Object.entries(d.uptae);
  chart("t1-uptae", {
    type: "bar",
    data: { labels: ut.map(([k, v]) => `${k} (${fmt(v.n)})`), datasets: [{ data: ut.map(([, v]) => v.S36[0] * 100), backgroundColor: "#60a5fa" }] },
    options: { indexAxis: "y", maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (t) => `3년 생존 ${t.parsed.x.toFixed(1)}% (95% CI ${pct(ut[t.dataIndex][1].S36[1])}–${pct(ut[t.dataIndex][1].S36[2])})` } } },
      scales: { x: { min: 40, max: 80, title: { display: true, text: "3년 생존율 (%)" } } } },
  });
  const rows = Object.entries(c).map(([k, v]) => `<tr><td>${k} 개업</td><td>${fmt(v.n)}</td><td>${pct(v.S12[0])}</td><td>${pct(v.S36[0])}</td><td>${v.S60 ? pct(v.S60[0]) : "–"}</td></tr>`).join("");
  $("#t1-table").innerHTML = `<tr><th>개업 시기</th><th>가게 수</th><th>1년 생존</th><th>3년 생존</th><th>5년 생존</th></tr>${rows}`;
  const gu = d.gu;
  $("#t1-facts").innerHTML = [
    `<b>최근에 문을 연 가게일수록 빨리 닫습니다.</b> 3년 생존율은 2010–2014 개업 ${pct(c["2010-2014"].S36[0])} → 2015–2019 ${pct(c["2015-2019"].S36[0])} → 2020–2022 ${pct(c["2020-2022"].S36[0])}로 내려갔습니다. 신뢰구간이 ±0.4%p 안이라 우연으로 보기 어렵습니다.`,
    `<b>카페 등 휴게음식점이 더 빨리 닫습니다.</b> 3년 생존율 일반음식점 ${pct(d.kind["일반음식점"].S36[0])}, 휴게음식점 ${pct(d.kind["휴게음식점"].S36[0])}.`,
    `<b>구별 차이가 큽니다.</b> 3년 생존율 최고 ${gu[0].gu} ${pct(gu[0].S36)}, 최저 ${gu[gu.length - 1].gu} ${pct(gu[gu.length - 1].S36)}. 강남구는 가게가 많은 만큼 교체도 빠릅니다.`,
    `<b>예측은 “어느 정도”만 됩니다.</b> 2015–2019 개업으로 학습해 2020년 이후 개업을 맞혀 보니 AUC ${m.auc_test.toFixed(3)}. 전체 평균 3년 내 폐업률은 ${pct(m.base_rate_test)}인데, 모델이 가장 위험하다고 본 상위 10%는 실제로 ${pct(m.top10pct_closure_rate)}가 문을 닫았습니다.`,
  ].map((x) => `<li>${x}</li>`).join("");
  setTimeout(() => map.invalidateSize(), 100);
}

/* ---------------------------------------------------------------- T4 */
async function drawT4() {
  const d = await load("t4");
  if (!d) return;
  const s = d.summary;
  kpis("#t4-kpi", [
    [fmt(s.unique_awards), "용역 낙찰 건수 (2025년 6~8월)"],
    [s.participants_median + "곳", "공고당 참가 업체 수 (중앙값)"],
    [pct(s.single_bidder_share), "참가 업체가 1곳 이하인 공고"],
    [fmt(s.winner_firms), "낙찰받은 서로 다른 업체 수"],
  ]);
  chart("t4-hist", { type: "bar", data: { labels: d.hist.map((x) => x[0]), datasets: [{ data: d.hist.map((x) => x[1]), backgroundColor: "#60a5fa" }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { title: { display: true, text: "공고 수" } } } } });
  chart("t4-win", { type: "bar", data: { labels: d.win_dist.map((x) => x[0]), datasets: [{ data: d.win_dist.map((x) => x[1]), backgroundColor: "#2563eb" }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { type: "logarithmic", title: { display: true, text: "업체 수 (로그)" } } } } });
  $("#t4-ag").innerHTML = `<tr><th>발주기관</th><th>낙찰 건수</th><th>참가 업체 중앙값</th><th>평균</th></tr>` +
    d.agencies.map((a) => `<tr><td>${a[0]}</td><td>${fmt(a[1])}</td><td>${a[2]}</td><td>${a[3]}</td></tr>`).join("");
  $("#t4-facts").innerHTML = [
    `<b>경쟁은 ‘보통 적고, 가끔 엄청 많다’.</b> 중앙값은 ${s.participants_median}곳인데 평균은 ${s.participants_mean}곳입니다. 100곳 넘게 몰린 공고가 ${pct(s.ge_100_bidders_share)} 있어 평균을 끌어올립니다.`,
    `<b>다섯 건 중 한 건은 사실상 단독 응찰</b>입니다(${pct(s.single_bidder_share)}). 이런 공고를 찾는 것 자체가 중소기업에 유용한 정보입니다.`,
    `<b>낙찰이 소수 업체에 크게 몰리진 않습니다.</b> 상위 1% 업체가 전체 낙찰의 ${pct(s.top1pct_firms_award_share)}를 가져갔고, 3개월 동안 5건 이상 낙찰받은 업체는 ${fmt(s.firms_ge5_wins)}곳입니다.`,
    `<b>금액이 크다고 경쟁이 치열하진 않았습니다.</b> 낙찰 금액과 참가 업체 수의 순위 상관은 ${s.spearman_amount_vs_participants}로 거의 없습니다.`,
  ].map((x) => `<li>${x}</li>`).join("");
}

/* ---------------------------------------------------------------- T5 */
async function drawT5() {
  const d = await load("t5");
  if (!d) return;
  const s = d.summary;
  kpis("#t5-kpi", [
    [fmt(s.rows), "가락시장 품목·등급별 가격 기록"],
    [s.days + "일", `거래일 수 (${s.date_min} ~ ${s.date_max})`],
    [pct(s.repeat_share), "전날 값이 그대로 이월된 기록 (분석에서 제외)"],
    [s.spread_forecast_last26w.naive + "%", "다음 주 가격비 예측 오차 (지난주 값 그대로)"],
  ]);
  const sel = $("#t5-sel");
  sel.innerHTML = Object.keys(d.series).map((k) => `<option>${k}</option>`).join("");
  let ch;
  const draw = () => {
    const ser = d.series[sel.value];
    if (ch) ch.destroy();
    ch = chart("t5-chart", { type: "line", data: { labels: ser.map((x) => x[0]), datasets: [{ label: sel.value, data: ser.map((x) => x[1] * 100), borderColor: "#16a34a", pointRadius: 0, borderWidth: 2 }] },
      options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (t) => `하품 가격 = 특품의 ${t.parsed.y.toFixed(1)}%` } } },
        scales: { y: { min: 0, title: { display: true, text: "하품/특품 (%)" } }, x: { ticks: { maxTicksLimit: 8 } } } } });
  };
  sel.onchange = draw;
  draw();
  $("#t5-table").innerHTML = `<tr><th>품목</th><th>관측 수 (날짜×단위)</th><th>하품/특품 평균</th><th>변동 (표준편차)</th></tr>` +
    d.items.slice(0, 20).map((r) => `<tr><td>${r[0]}</td><td>${fmt(r[1])}</td><td>${pct(r[2])}</td><td>${(r[3] * 100).toFixed(1)}%p</td></tr>`).join("");
  $("#t5-facts").innerHTML = [
    `<b>데이터 품질 문제를 먼저 발견했습니다.</b> 기록의 ${pct(s.repeat_share)}가 전날과 똑같은 평균가였습니다. 거래가 없는 날 값을 이월한 것으로 보고 제외했고, 남은 ${fmt(s.rows_after_repeat_removal)}건으로 계산했습니다.`,
    `<b>등급 간 가격차는 품목마다 크게 다릅니다.</b> 하품 가격이 특품의 약 28%(생표고)인 품목부터 약 60%(양파·대파)인 품목까지 있습니다.`,
    `<b>같은 품목 안에서도 흔들림이 큽니다.</b> 가격비의 표준편차가 품목별로 약 9~22%p라, “못난이는 늘 특품의 몇 %”로 고정하기 어렵습니다. 그래서 예측이 필요하다는 근거가 됩니다.`,
    `<b>단순 예측의 오차는 약 16%입니다.</b> 최근 26주 동안 ${s.spread_forecast_items}개 품목에 대해 “지난주 가격비 그대로”로 예측하면 평균 오차 ${s.spread_forecast_last26w.naive}%, “최근 4주 평균”은 ${s.spread_forecast_last26w.ma4}%였습니다. 더 나은 모델은 이 기준을 넘어야 의미가 있습니다.`,
    `<b>등급은 특·상·보통·하 네 단계</b>로 기록돼 있어 “특 대비 하”를 바로 계산할 수 있었습니다.`,
  ].map((x) => `<li>${x}</li>`).join("");
}

/* ---------------------------------------------------------------- T2·T3 (별도 파일) */
async function drawT3() { if (window.renderT3) await window.renderT3(await load("t3")); }
async function drawT2() { if (window.renderT2) await window.renderT2(await load("t2")); }
async function drawSum() { if (window.renderSum) window.renderSum(); }

const DRAW = { t1: drawT1, t3: drawT3, t2: drawT2, t4: drawT4, t5: drawT5, sum: drawSum };
function show() {
  const id = (location.hash || "#home").slice(1);
  document.querySelectorAll("section").forEach((s) => s.classList.toggle("on", s.id === id));
  document.querySelectorAll("#nav a").forEach((a) => a.classList.toggle("on", a.dataset.s === id));
  if (DRAW[id] && !drawn[id]) { drawn[id] = true; DRAW[id](); }
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", show);
window.addEventListener("DOMContentLoaded", show);
