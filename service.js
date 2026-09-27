/* 직접 써보기: 실데이터 집계(svc_*.json)에 공개된 규칙을 적용해 판정 표지판을 그린다 */
window.svc = (() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const opt = (v, t, sel) => `<option value="${esc(v)}"${sel ? " selected" : ""}>${esc(t)}</option>`;
  const pp = (x) => (x * 100).toFixed(1) + "%p";
  const won = (x) => Math.round(x / 100) * 100;
  const WORD = { go: "양호", caution: "보통", stop: "나쁨", info: "참고" };

  function plate(cls, label, title, text, lamps, extra = "") {
    return `<div class="plate ${cls}"><div class="verdict"><small>${label}</small><strong>${title}</strong><p>${text}</p></div>
      <ul class="lamps">${lamps.map(([c, b, s, w]) => `<li class="lamp ${c}"><i aria-hidden="true"></i><div><b><span class="st ${c}">${w || WORD[c] || "판정 제외"}</span>${b}</b><span>${s}</span></div></li>`).join("")}</ul>${extra}</div>`;
  }
  function bars(values, labels) {
    const mx = Math.max(...values, 1e-9);
    return `<div class="bars">${values.map((v, i) => `<div style="height:${Math.max(3, (v / mx) * 100)}%" title="${labels[i]}: ${fmt(v)}"></div>`).join("")}</div>
      <div class="bars-x"><span>${labels[0]}</span><span>${labels[labels.length - 1]}</span></div>`;
  }

  /* ------------------------------------------------------------ 가게 창업 진단 */
  async function t1() {
    const d = await load("svc_t1");
    const box = document.getElementById("t1-demo");
    if (!d) { box.innerHTML = '<div class="note">데이터를 불러오지 못했습니다.</div>'; return; }
    const gus = Object.keys(d.gu).sort((a, b) => a.localeCompare(b, "ko"));
    const ups = d.uptae;
    box.innerHTML = `<div class="ask"><h3>조건 고르기</h3><p class="small">가게를 열려는 구와 업종을 고르세요.</p>
      <label for="t1-gu">구</label><select id="t1-gu">${gus.map((g) => opt(g, g, g === "성북구")).join("")}</select>
      <label for="t1-up">업종</label><select id="t1-up">${ups.map((u) => opt(u, `${u} (서울 3년 폐업률 ${pct(d.seoul[u].c3)})`, u === "커피숍")).join("")}</select>
      <p class="rule"><b>판정 규칙</b><br>2019년~2023년 8월에 이 구에서 개업한 이 업종 가게의 3년 내 폐업률을 서울 같은 업종과 비교합니다. 3%p 이상 낮으면 “해볼 만한 조합”, 3%p 이상 높으면 “신중히 볼 조합”, 그 사이는 “서울 평균 수준”. 개업이 100곳 미만이거나, 원천 데이터에서 2019~2020년 개업이 앞뒤 해의 30% 미만으로 빠진 조합(업종 분류 이상 10개)은 판정하지 않습니다.<br>개업 증가율과 경쟁 수는 실제 데이터에서 폐업률과 거의 관계가 없어(상관 0.11, 0.07) 판정에 넣지 않고 참고로만 보여 줍니다.</p></div>
      <div id="t1-plate" role="status" aria-live="polite"></div>`;
    const draw = () => {
      const g = document.getElementById("t1-gu").value, u = document.getElementById("t1-up").value;
      const s = d.gu[g] && d.gu[g][u], S = d.seoul[u];
      const out = document.getElementById("t1-plate");
      if (!s) { out.innerHTML = plate("", `${g} · ${u}`, "기록 없음", "이 조합의 개업 기록이 없습니다.", []); return; }
      const diff = s.c3 - S.c3;
      let cls = "caution", title = "서울 평균 수준";
      if (s.anomaly) { cls = ""; title = "원천 데이터 문제로 판정 보류"; }
      else if (s.c3_n < 100) { cls = ""; title = "표본이 적어 판정 보류"; }
      else if (diff <= -0.03) { cls = "go"; title = "해볼 만한 조합"; }
      else if (diff >= 0.03) { cls = "stop"; title = "신중히 볼 조합"; }
      const text = s.anomaly
        ? `이 구는 2019~2020년 인허가를 다른 업종 이름(주로 ‘기타 휴게음식점’ 또는 ‘일반조리판매’)으로 바꿔 분류한 흔적이 있어, 이 기간 ${u} 개업이 ${fmt(s.open_by_year[3])}곳·${fmt(s.open_by_year[4])}곳으로 앞뒤 해와 크게 어긋납니다. 이 때문에 폐업률이 왜곡될 수 있으므로 판정하지 않습니다. 참고로 계산값은 ${pct(s.c3)} (서울 ${pct(S.c3)})입니다.`
        : s.c3_n < 100
        ? `2019년~2023년 8월 개업이 ${fmt(s.c3_n)}곳뿐이라 비율이 흔들립니다. 3년 내 폐업률 ${pct(s.c3)} (서울 같은 업종 ${pct(S.c3)}).`
        : `${g}에서 문을 연 ${u} 가게는 3년 안에 ${pct(s.c3)}가 닫았습니다. 서울 같은 업종(${pct(S.c3)})보다 ${pp(Math.abs(diff))} ${diff < 0 ? "낮습니다" : "높습니다"}.`;
      const gcls = "info";
      const rank = (arr) => arr.filter((x) => x[1] && x[1].c3_n >= 100 && !x[1].anomaly);
      const inGu = rank(ups.map((x) => [x, d.gu[g][x]])).map(([x, v]) => [x, v.c3 - d.seoul[x].c3]).sort((a, b) => a[1] - b[1]).slice(0, 3);
      const byGu = rank(gus.map((x) => [x, d.gu[x][u]])).sort((a, b) => a[1].c3 - b[1].c3).slice(0, 3);
      const extra = `<div class="also"><b>연도별 개업 수</b> (${d.years[0]}–${d.years[d.years.length - 1]})${bars(s.open_by_year, d.years)}
        <p style="margin-top:12px"><b>${g}에서 서울 평균보다 덜 닫은 업종:</b> ${inGu.map(([x, v]) => `${x} (${v < 0 ? "−" : "+"}${pp(Math.abs(v))})`).join(", ") || "표본 부족"}</p>
        <p style="margin:0"><b>${u} 3년 폐업률이 낮은 구:</b> ${byGu.map(([x, v]) => `${x} ${pct(v.c3)}`).join(", ")}</p></div>`;
      out.innerHTML = plate(cls, `${g} · ${u}`, title, text, [
        [cls || "", `3년 내 폐업률 ${pct(s.c3)}`, `서울 같은 업종 ${pct(S.c3)} · 2019–2023.8 개업 ${fmt(s.c3_n)}곳 기준 · 판정 기준`],
        [gcls, `최근 3년 개업 증가율 ${s.growth === null ? "–" : (s.growth >= 0 ? "+" : "") + pct(s.growth)}`, `2023–2025 개업 수를 2020–2022와 비교 · 서울 같은 업종 ${(S.growth >= 0 ? "+" : "") + pct(S.growth)} · 참고`],
        [gcls, `지금 영업 중 ${fmt(s.active)}곳`, `같은 업종의 구별 중앙값 ${fmt(S.active_median_gu)}곳 · 최근 12개월 폐업 ${fmt(s.closed_12m)}곳 · 참고`],
      ], extra);
    };
    box.querySelectorAll("select").forEach((el) => (el.onchange = draw));
    draw();
  }

  /* ------------------------------------------------------------ 빌라 전세 안심 체크 */
  async function t3() {
    const d = await load("svc_t3");
    const box = document.getElementById("t3-demo");
    if (!d) { box.innerHTML = '<div class="note">데이터를 불러오지 못했습니다.</div>'; return; }
    const S = d.seoul;
    const gus = Object.keys(d.gu).sort((a, b) => a.localeCompare(b, "ko"));
    box.innerHTML = `<div class="ask"><h3>조건 고르기</h3><p class="small">전세로 들어가려는 동네를 고르세요.</p>
      <label for="t3-gu">구</label><select id="t3-gu">${gus.map((g) => opt(g, g, g === "강서구")).join("")}</select>
      <label for="t3-dong">동</label><select id="t3-dong"></select>
      <p class="rule"><b>판정 규칙</b><br>신호 세 개를 서울 평균과 비교합니다. ① 2025년 재계약 보증금 하락 비율이 서울의 1.5배 이상이면 빨강, 절반 이하면 초록 ② 전세가율 중앙값이 80% 이상이면 빨강, 60% 이하면 초록 ③ 전세가율 80% 이상 계약 비율이 서울의 1.5배 이상이면 빨강, 절반 이하면 초록. 빨강 2개 이상이면 “위험 신호가 많은 동네”. 계약이 30건 미만인 신호는 판정에서 뺍니다.</p></div>
      <div id="t3-plate" role="status" aria-live="polite"></div>`;
    const guSel = document.getElementById("t3-gu"), dSel = document.getElementById("t3-dong");
    const fillDong = () => {
      const g = guSel.value;
      const ds = Object.keys(d.dong).filter((k) => k.startsWith(g + "|")).map((k) => k.split("|")[1]).sort((a, b) => a.localeCompare(b, "ko"));
      dSel.innerHTML = opt("", "구 전체", true) + ds.map((x) => opt(x, x, g === "강서구" && x === "화곡동")).join("");
    };
    const draw = () => {
      const g = guSel.value, dn = dSel.value;
      const a = dn ? d.dong[`${g}|${dn}`] : d.gu[g];
      const name = dn ? `${g} ${dn}` : `${g} 전체`;
      const L = [];
      if ((a.ren2025_n || 0) >= 30) {
        const r = a.dec2025 / S.dec2025, c = r >= 1.5 ? "stop" : r <= 0.5 ? "go" : "caution";
        L.push([c, `재계약 때 보증금이 내려간 비율 ${pct(a.dec2025)}`, `2025년 갱신 전세 ${fmt(a.ren2025_n)}건 · 서울 ${pct(S.dec2025)} · 2023년 ${a.dec2023 != null ? pct(a.dec2023) : "–"}, 2024년 ${a.dec2024 != null ? pct(a.dec2024) : "–"}`]);
      } else L.push(["", "재계약 보증금 하락: 판정 제외", `2025년 갱신 전세가 ${fmt(a.ren2025_n || 0)}건뿐입니다`]);
      if ((a.ratio_n || 0) >= 30) {
        const m = a.ratio_med, c = m >= 0.8 ? "stop" : m <= 0.6 ? "go" : "caution";
        L.push([c, `전세가율 중앙값 ${pct(m)}`, `같은 건물 매매가 대비 보증금 · 서울 ${pct(S.ratio_med)} · 매칭된 전세 ${fmt(a.ratio_n)}건 (매칭률 ${pct(a.match || 0)})`]);
        const r = a.ratio_ge80 / S.ratio_ge80, c2 = r >= 1.5 ? "stop" : r <= 0.5 ? "go" : "caution";
        L.push([c2, `전세가율 80% 이상 계약 ${pct(a.ratio_ge80)}`, `서울 ${pct(S.ratio_ge80)}`]);
      } else {
        L.push(["", "전세가율: 판정 제외", `같은 건물 매매가를 찾은 전세가 ${fmt(a.ratio_n || 0)}건뿐입니다`]);
      }
      const stops = L.filter((x) => x[0] === "stop").length, gos = L.filter((x) => x[0] === "go").length, judged = L.filter((x) => x[0]).length;
      let cls = "", title = "서울 평균 수준", text = "서울 평균과 비슷한 수준입니다.";
      if (!judged) { title = "거래가 적어 판정 보류"; text = "판정할 만큼 계약이 쌓이지 않은 동네입니다."; }
      else if (stops >= 2) { cls = "stop"; title = "위험 신호가 많은 동네"; text = `세 신호 중 ${stops}개가 서울 평균보다 뚜렷하게 나쁩니다.`; }
      else if (stops === 1) { cls = "caution"; title = "주의할 신호가 있는 동네"; text = "한 가지 신호가 서울 평균보다 뚜렷하게 나쁩니다."; }
      else if (gos >= 2) { cls = "go"; title = "상대적으로 안정적인 동네"; text = "신호 대부분이 서울 평균보다 양호합니다."; }
      const extra = `<div class="also">2025년 이 동네 전월세 계약 ${fmt(a.rent25_n || 0)}건 중 전세 ${a.jeonse_share25 != null ? pct(a.jeonse_share25) : "–"} (서울 ${pct(S.jeonse_share25)}).<br><span class="small">등기부(근저당)와 임대인 신용정보는 공개되지 않아 반영하지 못했습니다. 계약 전 등기부와 전세보증보험 가입 가능 여부는 따로 확인해야 합니다.</span></div>`;
      document.getElementById("t3-plate").innerHTML = plate(cls, name, title, text, L, extra);
    };
    guSel.onchange = () => { fillDong(); draw(); };
    dSel.onchange = draw;
    fillDong();
    draw();
  }

  /* ------------------------------------------------------------ 빌라 투자 동네 비교 */
  async function t2() {
    const d = await load("svc_t3");
    const box = document.getElementById("t2-demo");
    if (!d) { box.innerHTML = '<div class="note">데이터를 불러오지 못했습니다.</div>'; return; }
    const S = d.seoul;
    const gus = Object.keys(d.gu).sort((a, b) => a.localeCompare(b, "ko"));
    box.innerHTML = `<div class="ask"><h3>조건 고르기</h3><p class="small">투자를 검토하는 구를 고르세요.</p>
      <label for="t2-gu">구</label><select id="t2-gu">${gus.map((g) => opt(g, g, g === "관악구")).join("")}</select>
      <p class="rule"><b>읽는 법</b><br>월세 수익률 = 연 월세 ÷ (추정 매매가 − 보증금). “실제가/추정가”는 2024–2025 거래가를 AI 추정 시세로 나눈 값을 서울 전체 치우침(1.055배)으로 보정했습니다. 1보다 작으면 추정보다 싸게 거래된 동네입니다.<br><b>후보 표시</b>: 수익률이 서울 중앙값(${S.yield_med}%) 이상이고 실제가/추정가가 1 미만. 추정 오차 중앙값이 14.3%라 개별 매물 판단에는 쓰지 마세요.</p></div>
      <div id="t2-plate" role="status" aria-live="polite"></div>`;
    const draw = () => {
      const g = document.getElementById("t2-gu").value, a = d.gu[g];
      const rows = Object.entries(d.dong).filter(([k, v]) => k.startsWith(g + "|") && ((v.yield_n || 0) >= 20 || (v.avm_n || 0) >= 20))
        .map(([k, v]) => ({ dong: k.split("|")[1], ...v, adj: v.rel_med ? v.rel_med / S.rel_med : null }))
        .sort((x, y) => (y.yield_med || 0) - (x.yield_med || 0));
      const pick = (r) => r.yield_med >= S.yield_med && r.adj !== null && r.adj < 1 && (r.yield_n || 0) >= 20 && (r.avm_n || 0) >= 20;
      const nPick = rows.filter(pick).length;
      const adjG = a.rel_med / S.rel_med;
      const chg = a.ppm22 ? a.ppm24 / a.ppm22 - 1 : null;
      const table = `<div class="also" style="padding-inline:0 0"><div class="tw" style="box-shadow:none"><table class="rank"><tr><th>동</th><th>월세 수익률</th><th>실제가/추정가</th><th>㎡당 매매가 (2024–25)</th><th>2022–23 대비</th><th></th></tr>
        ${rows.map((r) => `<tr class="${pick(r) ? "pick" : ""}"><td>${esc(r.dong)}</td><td>${r.yield_med != null ? r.yield_med + "%" : "–"} <span class="small">(${fmt(r.yield_n || 0)}건)</span></td><td>${r.adj != null ? r.adj.toFixed(2) + "배" : "–"}</td><td>${r.ppm24 != null ? fmt(Math.round(r.ppm24)) + "만 원" : "–"}</td><td>${r.ppm22 && r.ppm24 ? ((r.ppm24 / r.ppm22 - 1) * 100).toFixed(1) + "%" : "–"}</td><td>${pick(r) ? '<span class="tag go">후보</span>' : ""}</td></tr>`).join("")}</table></div></div>`;
      document.getElementById("t2-plate").innerHTML = plate("", `${g} 전체`, `월세 수익률 ${a.yield_med}%`,
        `서울 중앙값 ${S.yield_med}%와 비교한 값입니다. 이 구에서 후보 조건에 맞는 동은 ${nPick}곳입니다.`, [
          ["info", `실제가/추정가 ${adjG.toFixed(2)}배`, `2024–2025 거래 ${fmt(a.avm_n)}건 · 1보다 작으면 추정보다 싸게 거래`],
          ["info", `㎡당 매매가 ${fmt(Math.round(a.ppm24))}만 원`, `서울 ${fmt(Math.round(S.ppm24))}만 원 · 2022–23 대비 ${chg != null ? (chg * 100).toFixed(1) + "%" : "–"}`],
          ["info", `월세 계약 ${fmt(a.yield_n)}건으로 계산`, `같은 건물의 2022년 이후 매매 단가를 면적으로 환산한 추정 매매가 사용`],
        ], table);
    };
    document.getElementById("t2-gu").onchange = draw;
    draw();
  }

  /* ------------------------------------------------------------ 못난이 적정가 */
  async function t5() {
    const d = await load("svc_t5");
    const box = document.getElementById("t5-demo");
    if (!d) { box.innerHTML = '<div class="note">데이터를 불러오지 못했습니다.</div>'; return; }
    const items = d.items.filter((x) => x.top_price);
    box.innerHTML = `<div class="ask"><h3>조건 고르기</h3><p class="small">가격을 알고 싶은 품목을 고르세요.</p>
      <label for="t5-item">품목 (거래 단위)</label><select id="t5-item">${items.map((x, i) => opt(i, `${x.item} · ${x.unit}`, x.item === "양파")).join("")}</select>
      <p class="rule"><b>계산 방법</b><br>적정가 범위 = 최근 2주 특품 경락가 중앙값 × 최근 8주 하품/특품 가격비의 중간 범위(25~75%). 과거 검증에서 이 범위에 다음 주 가격비가 들어온 비율은 ${pct(d.coverage)}였습니다(${fmt(d.coverage_n)}주). 협상의 출발점으로만 쓰세요.</p></div>
      <div id="t5-plate" role="status" aria-live="polite"></div>`;
    const draw = () => {
      const x = items[+document.getElementById("t5-item").value];
      const lo = won(x.top_price * x.r25), hi = won(x.top_price * x.r75);
      const inside = x.low_price && x.low_price >= lo && x.low_price <= hi;
      const stale = (new Date(d.asof) - new Date(x.last_obs)) / 864e5 > 14;
      const w = x.weekly;
      document.getElementById("t5-plate").innerHTML = plate("", `${x.item} · ${x.unit} · ${d.asof} 기준`, `하품 ${fmt(lo)}~${fmt(hi)}원`,
        `최근 특품 ${fmt(x.top_price)}원에 최근 8주 가격비 ${pct(x.r25)}~${pct(x.r75)}를 곱한 범위입니다.${stale ? ` 마지막 거래가 ${x.last_obs}라 오래된 값입니다.` : ""}`, [
          [x.low_price ? (inside ? "go" : "caution") : "", `최근 2주 실제 하품 ${x.low_price ? fmt(x.low_price) + "원" : "–"}`, x.low_price ? (inside ? "계산한 범위 안에 있습니다" : "계산한 범위를 벗어났습니다. 최근 시세가 빠르게 움직이는 중입니다") : "최근 하품 거래가 없습니다", x.low_price ? (inside ? "범위 안" : "범위 밖") : "거래 없음"],
          ["info", `가격비 중앙값 최근 8주 ${pct(x.r50)} · 2년 전체 ${pct(x.rall)}`, `하품 가격이 특품 가격의 몇 %인지 · 관측 ${fmt(x.obs)}회`],
        ], `<div class="also"><b>최근 52주 하품/특품 가격비</b>${bars(w.map((v) => v[1]), w.map((v) => v[0]))}</div>`);
    };
    document.getElementById("t5-item").onchange = draw;
    draw();
  }

  return { t1, t3, t2, t5 };
})();
