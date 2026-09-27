/* T3 전세 위험 · T2 저평가 매입 · 종합 판정 */
const GRADE = (g, cls = "") => `<span class="grade ${cls}">${g}</span>`;

window.renderT3 = async function (d) {
  const box = document.getElementById("t3-body");
  if (!d) { box.innerHTML = '<div class="note">데이터가 아직 없습니다.</div>'; return; }
  const s = d.summary, by = s.by_year, rv = s.reverse_jeonse_by_year, jr = s.jeonse_ratio;
  const ys = Object.keys(by).sort();
  const pre19 = by[ys[0]].preDeposit_filled, pre25 = by[ys[ys.length - 1]].preDeposit_filled;
  const rvs = Object.keys(rv).sort();
  const peak = rvs.reduce((a, y) => (rv[y].decrease_share > rv[a].decrease_share ? y : a), rvs[0]);
  box.innerHTML = `
  <div class="grid">
   <div class="kpi"><b>${fmt(s.rent_rows)}</b><span>서울 연립다세대 전월세 실거래 (2019–2025)</span></div>
   <div class="kpi"><b>${fmt(s.trade_rows)}</b><span>같은 기간 매매 실거래</span></div>
   <div class="kpi"><b>${pct(rv[peak].decrease_share)}</b><span>${peak}년 갱신 전세 중 보증금이 내려간 비율 (최고치)</span></div>
   <div class="kpi"><b>${pct(s.building_match_rate)}</b><span>2024–2025 전세 중 같은 건물 매매가를 찾은 비율</span></div>
  </div>
  <h3>① 지금 결과</h3>
  <div class="card"><b>2025년 구별 “갱신 전세 중 보증금이 내려간 비율”</b> <span class="small">동그라미 크기 = 갱신 전세 건수, 색 = 하락 비율</span>
   <div id="t3-map" class="map" style="margin-top:8px"></div>
   <div class="legend"><span><i style="background:#1d4ed8"></i>낮음</span><span><i style="background:#fbbf24"></i>중간</span><span><i style="background:#dc2626"></i>높음</span></div></div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
   <div class="card"><b>연도별 “종전 보증금”이 채워진 비율</b><div class="chart"><canvas id="t3-fill"></canvas></div></div>
   <div class="card"><b>분기별 갱신 전세의 보증금 하락 비율</b><div class="chart"><canvas id="t3-trend"></canvas></div></div>
  </div>
  <div class="tw"><table><tr><th>연도</th><th>계약 수</th><th>전세 비중</th><th>종전 보증금 채움</th><th>갱신 비중</th><th>갱신 전세(비교 가능)</th><th>보증금 하락 비율</th><th>변화율 중앙값</th></tr>
   ${ys.map((y) => `<tr><td>${y}</td><td>${fmt(by[y].n)}</td><td>${pct(by[y].jeonse_share)}</td><td>${pct(by[y].preDeposit_filled)}</td><td>${pct(by[y].renewal_share)}</td><td>${rv[y] ? fmt(rv[y].n_renewal_jeonse) : "–"}</td><td>${rv[y] ? pct(rv[y].decrease_share) : "–"}</td><td>${rv[y] ? rv[y].median_change_pct + "%" : "–"}</td></tr>`).join("")}
  </table></div>
  <div class="note"><b>지금 데이터에서 확인된 사실</b><ul style="margin:6px 0 0">
   <li><b>종전 보증금 필드:</b> ${ys[0]}년 계약은 ${pct(pre19)}, ${ys[ys.length - 1]}년 계약은 ${pct(pre25)}가 채워져 있습니다. 채워진 비율이 매년 <b>갱신 계약 비중과 거의 같아</b>, 종전 보증금은 갱신 계약에만 기록되는 것으로 보입니다. ${pre19 < 0.05 ? "2021년 이전에는 사실상 비어 있어 역전세 계산은 2021년 이후에만 가능합니다." : ""}</li>
   <li><b>역전세 흐름:</b> 갱신 전세 중 보증금이 내려간 비율은 ${rvs.map((y) => `${y}년 ${pct(rv[y].decrease_share)}`).join(" → ")}입니다. 가장 높았던 해는 ${peak}년입니다.</li>
   <li><b>2025년 구별 차이:</b> 보증금이 내려간 비율이 가장 높은 곳은 ${d.gu2025.slice(0, 3).map((g) => `${g.gu} ${pct(g.dec)}`).join(", ")}, 가장 낮은 곳은 ${d.gu2025.slice(-3).map((g) => `${g.gu} ${pct(g.dec)}`).join(", ")}입니다. 강서구는 2021~2023년 빌라 전세 피해가 집중됐던 지역입니다.</li>
   <li><b>건물 매칭:</b> 2024–2025 전세 ${fmt(s.jeonse_2024_2025_n)}건 중 같은 건물(구·동·지번·건물명)의 2022년 이후 매매 기록을 찾은 비율은 ${pct(s.building_match_rate)}입니다. 빌라는 매매가 드물어 나머지는 동 단위 추정이 필요합니다.</li>
   <li><b>전세가율:</b> 매칭된 ${fmt(jr.n)}건의 전세가율 중앙값은 ${pct(jr.median)}, 80% 이상은 ${pct(jr.share_ge_0_8)}, 100% 이상(보증금이 매매가보다 큼)은 ${pct(jr.share_ge_1_0)}입니다. <i>같은 건물의 다른 호실 매매가를 면적으로 환산한 값이라 오차가 있습니다.</i></li>
   <li><b>해제된 매매</b> ${fmt(s.trade_cancelled)}건은 분석에서 뺐습니다.</li>
  </ul></div>
  <div class="note warn"><b>한계:</b> 등기부(근저당)와 임대인 신용정보는 공개되지 않습니다. 정부 시범모델도 이 정보가 가장 중요했다고 밝혔습니다. 이 결과는 ‘사기 탐지’가 아니라 <b>‘보증금 회수 위험’ 참고 지표</b>입니다.</div>
  <h3>② 데이터를 더 모으면</h3>
  <div class="card"><ul style="margin:0">
   <li><b>기간을 2011년까지 늘려도</b> 종전 보증금은 ${pre19 < 0.05 ? "신고제 이전에는 거의 비어 있을 것으로 보여" : "일부만 있어"}, 역전세 지표는 최근 몇 년에만 계산됩니다. 대신 매매·전세 금액 자체로 <b>전세가율의 장기 추세</b>는 볼 수 있습니다. <i>(서울 2019년 값을 근거로 한 예상)</i></li>
   <li><b>전국으로 늘리면</b> 2021~2023년 전세 피해가 컸던 서울 밖 지역(인천·경기 등)까지 비교할 수 있습니다. 전국은 서울보다 매칭률이 더 낮을 수 있습니다.</li>
   <li><b>아파트·오피스텔을 더하면</b> 매매 기록이 많아 건물 매칭률이 오를 것으로 봅니다. 다만 전세사기는 빌라에 집중됐으므로 핵심은 빌라입니다.</li>
  </ul></div>
  <h3>③ 과제 성취도 (예상)</h3>
  <div class="tw"><table><tr><th>평가 항목</th><th>지금 데이터만으로</th><th>전국·장기 확장 시</th></tr>
   <tr><td>데이터 규모·관리</td><td>${GRADE("A-")} ${fmt(s.rent_rows + s.trade_rows)}건, 구×월 파티션이 자연스러움</td><td>${GRADE("A")} 수백만 건대, 건물 차원 테이블과 조인</td></tr>
   <tr><td>분석 깊이</td><td>${GRADE("B+", "b")} 역전세율·전세가율까지. 매칭률 ${pct(s.building_match_rate)}가 제약</td><td>${GRADE("A-")} 지역 비교·장기 추세·외부 검증(HUG)</td></tr>
   <tr><td>차별성·의미</td><td colspan="2">${GRADE("A")} 사회적 공감도가 가장 높음. 종전 보증금을 쓰는 팀은 드물 것</td></tr>
  </table></div>
  <h3>④ 수집 방법과 걸리는 시간</h3>
  <div class="tw"><table><tr><th>데이터</th><th>방법</th><th>걸리는 시간</th><th>마감 안에?</th></tr>
   <tr><td>서울 연립다세대 전월세·매매 2019–2025</td><td>국토부 API, 구×월 단위 (한 번에 최대 1,000행)</td><td>실측: 초당 호출 제한 때문에 병렬 2개·호출 간 0.35초로 API당 약 10분</td><td>✔ 완료</td></tr>
   <tr><td>서울 2011–2018 추가</td><td>같은 방식</td><td>API당 약 10분 (추정)</td><td>✔</td></tr>
   <tr><td>전국 약 250개 시군구</td><td>같은 방식, API당 하루 10,000회</td><td>2011~ 전월세는 API당 약 4.7만 회 → <b>약 5일</b></td><td>✔ 10/19 전 가능 (지금 시작 시)</td></tr>
  </table></div>`;
  const map = baseMap("t3-map");
  const vals = d.gu2025.map((g) => g.dec), lo = Math.min(...vals), hi = Math.max(...vals);
  const col = (v) => { const t = (v - lo) / (hi - lo || 1); return t < 0.33 ? "#1d4ed8" : t < 0.66 ? "#fbbf24" : "#dc2626"; };
  const nmax = Math.max(...d.gu2025.map((g) => g.n));
  d.gu2025.forEach((g) => L.circleMarker([g.lat, g.lon], { radius: 6 + 14 * Math.sqrt(g.n / nmax), color: "#0f172a", weight: 1, fillColor: col(g.dec), fillOpacity: 0.8 })
    .bindTooltip(`<b>${g.gu}</b><br>2025 갱신 전세 ${fmt(g.n)}건<br>보증금 하락 ${pct(g.dec)} · 변화율 중앙값 ${g.med_change}%`).addTo(map));
  setTimeout(() => map.invalidateSize(), 100);
  chart("t3-fill", { type: "bar", data: { labels: ys, datasets: [{ data: ys.map((y) => by[y].preDeposit_filled * 100), backgroundColor: "#60a5fa" }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 100, title: { display: true, text: "%" } } } } });
  chart("t3-trend", { type: "line", data: { labels: d.trend.map((x) => x[0]), datasets: [{ data: d.trend.map((x) => x[2] * 100), borderColor: "#dc2626", pointRadius: 2, borderWidth: 2 }] },
    options: { maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: (t) => `하락 ${t.parsed.y.toFixed(1)}% (n=${fmt(d.trend[t.dataIndex][1])})` } } },
      scales: { y: { min: 0, title: { display: true, text: "보증금 하락 비율 (%)" } } } } });
};

window.renderT2 = async function (d) {
  const box = document.getElementById("t2-body");
  if (!d) { box.innerHTML = '<div class="note">데이터가 아직 없습니다.</div>'; return; }
  const s = d.summary, y = s.yield;
  box.innerHTML = `
  <div class="grid">
   <div class="kpi"><b>${fmt(s.trade_rows_valid)}</b><span>해제 제외 매매 (서울 연립다세대 2019–2025)</span></div>
   <div class="kpi"><b>${s.median_APE}%</b><span>추정가 오차 중앙값 (2024–2025 거래로 검증)</span></div>
   <div class="kpi"><b>${pct(s.within_10pct)}</b><span>추정가와 ±10% 안에 든 거래</span></div>
   <div class="kpi"><b>${y.median_pct}%</b><span>임대수익률 중앙값 (월세 ${fmt(y.n)}건)</span></div>
  </div>
  <h3>① 지금 결과</h3>
  <div class="card"><ul style="margin:0">
   <li><b>AI 추정가(AVM):</b> 2019–2023 매매 ${fmt(s.train_n)}건으로 학습하고 2024–2025 매매 ${fmt(s.test_n)}건으로 검증했습니다. 평균 오차 ${s.MAPE}%, 오차 중앙값 ${s.median_APE}%, ±10% 안에 든 거래는 ${pct(s.within_10pct)}입니다. 입력은 구·동·주택유형·면적·대지면적·층·연식·거래 시점뿐입니다.</li>
   <li><b>“추정가보다 15% 이상 싸게 거래된” 비율</b>은 ${pct(s.below_85pct_of_estimate)}입니다. 이것이 곧 저평가 매물이라는 뜻은 아닙니다. 모델이 모르는 요인(내부 상태, 급매, 특수관계 거래)이 섞여 있습니다.</li>
   <li><b>임대수익률:</b> 2024–2025 월세 계약을 같은 건물의 매매 단가와 붙이면, 연 임대료 ÷ (추정 매매가 − 보증금)의 중앙값은 ${y.median_pct}% (사분위 ${y.p25_pct}~${y.p75_pct}%)입니다. <i>매매 단가는 같은 건물 다른 호실의 값을 면적으로 환산했습니다.</i></li>
  </ul></div>
  <div class="note warn"><b>캐치리얼과의 차이:</b> 캐치리얼은 호가(매물)와 상가·빌딩까지 봅니다. 여기서는 공개된 실거래만 쓰므로 결과는 “지금 살 수 있는 매물”이 아니라 “과거에 싸게 거래된 경향이 있는 지역·유형”입니다.</div>
  <h3>② 데이터를 더 모으면</h3>
  <div class="card"><ul style="margin:0">
   <li><b>건축물대장(구조·세대수·사용승인일)을 붙이면</b> 추정가 오차가 줄어들 여지가 있습니다. 지금 모델에는 건물 특성이 연식·면적뿐입니다. <i>(예상)</i></li>
   <li><b>상업업무용·토지 매매를 더하면</b> 캐치리얼의 핵심 영역(상가·빌딩)을 다룰 수 있습니다. 다만 관악구 기준 월 20~30건 수준으로 거래가 적어 지역을 묶어야 합니다.</li>
   <li><b>기간·지역을 늘리면</b> 학습 데이터는 커지지만, 부동산은 시기마다 가격 수준이 달라 오래된 거래가 곧바로 정확도를 올리지는 않습니다.</li>
  </ul></div>
  <h3>③ 과제 성취도 (예상)</h3>
  <div class="tw"><table><tr><th>평가 항목</th><th>지금 데이터만으로</th><th>건축물대장·상업용 확장 시</th></tr>
   <tr><td>데이터 규모·관리</td><td>${GRADE("A-")} T3와 같은 데이터</td><td>${GRADE("A")} 건물 차원 조인</td></tr>
   <tr><td>분석 깊이</td><td>${GRADE("B+", "b")} AVM·수익률·백테스트</td><td>${GRADE("A-")} 설명 가능한 저평가 요인</td></tr>
   <tr><td>차별성</td><td colspan="2">${GRADE("B", "b")} “집값 예측”은 흔한 주제. T3의 투자자 탭으로 붙일 때 가치가 큼</td></tr>
  </table></div>
  <h3>④ 수집 방법과 걸리는 시간</h3>
  <div class="card">T3와 같은 국토부 매매 API입니다. 건축물대장은 지번 단위 조회라 매칭할 건물 수만큼 호출이 필요합니다(서울 빌라 건물 수만큼 → 수만 회, 하루 10,000회 한도로 수일 추정). 상업업무용·토지는 구×월 단위로 T3와 같은 속도입니다.</div>`;
};

window.renderSum = function () {
  document.getElementById("sum-body").innerHTML = `
  <div class="tw"><table>
   <tr><th>주제</th><th>실데이터로 확인된 것</th><th>드러난 약점</th><th>마감 안 확장</th><th>판정</th></tr>
   <tr><td><b>T1 가게 생존</b></td><td>68만 건, 생존곡선·업태·구 비교·예측(AUC 0.667)까지 결과가 이미 나옴</td><td>“상권 분석”과 비슷해 보일 위험, 예측력 중간</td><td>전국 3일 ✔</td><td>${GRADE("가장 안전")}</td></tr>
   <tr><td><b>T3 전세 위험</b></td><td>연립다세대 전월세·매매로 역전세율·전세가율 계산 가능</td><td>종전 보증금은 2021년 이후 갱신 계약에만 있음, 건물 매칭률 58%, 등기 정보 없음</td><td>전국 약 5일 ✔</td><td>${GRADE("의미 최고")}</td></tr>
   <tr><td><b>T2 저평가 매입</b></td><td>AVM·임대수익률 계산 가능</td><td>호가 없음, 흔한 주제</td><td>✔</td><td>${GRADE("T3 확장용", "b")}</td></tr>
   <tr><td><b>T4 공공조달</b></td><td>경쟁 강도·단독 응찰·집중도</td><td><b>낙찰목록에 경쟁사가 없음</b> → 관계망은 운영계정 필요</td><td>기간 확장 ✔ / 관계망 ✖</td><td>${GRADE("조건부", "c")}</td></tr>
   <tr><td><b>T5 농산물</b></td><td>등급 가격비·단순 예측 기준선</td><td><b>기록 34.6%가 이월 값</b>, 2년뿐, KAMIS 미확인</td><td>KAMIS에 달림</td><td>${GRADE("보류", "d")}</td></tr>
  </table></div>
  <div class="note ok"><b>결론:</b> 실데이터로 돌려 본 뒤에도 순위는 문서 평가와 같습니다. <b>T1이 가장 안전하고, T3가 가장 의미 있습니다.</b> 새로 드러난 사실은 T4의 경쟁사 관계망이 한도 때문에 사실상 불가능하다는 점과, T5 데이터의 약 3분의 1이 이월 값이라는 점입니다.</div>`;
};
