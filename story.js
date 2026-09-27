/* 팀원 공유용 이야기 구조: 첫 화면 비교, 주제별 장면·답, 과제 요구 체크, 파이프라인 실측, 팩트체크, 데이터 영수증 */
window.story = (() => {
  const T = {
    t1: {
      name: "가게 창업 진단", score: 87, badge: ["go", "가장 안전"],
      hookBig: "10곳 중 4곳", hook: "2020~2022년에 문을 연 서울 음식점·카페 가운데 41%는 3년 안에 문을 닫았습니다.",
      persona: "지수 씨는 성북구에 작은 카페를 열까 고민 중입니다. 중개사는 “요즘 카페 잘돼요”라고만 합니다.",
      question: "성북구에서 카페를 열면 3년을 버틸 수 있을까?",
      answer: "성북구에서 2019~2023년에 연 커피숍은 3년 안에 <b>26.8%</b>가 닫았습니다. 서울 커피숍 평균(38.8%)보다 12.0%p 낮아 <b>‘해볼 만한 조합’</b>입니다.",
      does: "서울 음식점·카페 68만 곳의 개업·폐업 기록으로, 구와 업종을 고르면 그 조합이 3년 안에 문을 닫은 비율을 서울 평균과 비교해 판정합니다.",
      plus: ["데이터·판정·지도가 이미 모두 작동", "Spark 팩트체크 5개 모두 일치", "전국 295만 건으로 3일이면 확장"],
      minus: ["‘상권 분석’ 주제와 비슷해 보일 위험", "폐업 예측력은 중간 (AUC 0.667)"],
      receipt: [
        ["서울시 일반음식점 인허가", "서울 열린데이터 API · LOCALDATA_072404", "1960년대 ~ 2026-09", "538,115", "인허가일, 폐업일, 영업상태, 업태, 주소, 좌표, 면적", "폐업인데 폐업일 없는 31건 제외 · 좌표 결측 9.4%"],
        ["서울시 휴게음식점 인허가", "서울 열린데이터 API · LOCALDATA_072405", "1960년대 ~ 2026-09", "147,665", "위와 같음", "마포구 등 10개 구·업종 조합에서 2019~2020년 업종 분류 이상 발견 → 판정 제외"],
        ["(확장) 전국 일반·휴게음식점 인허가", "공공데이터포털 · 행정안전부 API", "1980년 이전 ~ 현재", "2,947,890", "위와 같음 (폐업 2,073,119)", "건수·필드만 확인, 아직 적재 안 함"],
        ["(확장) 서울 상권 추정매출", "서울 열린데이터 API · VwsmTrdarSelngQq", "2021 3분기 ~ 2025 4분기", "481,462", "상권·업종별 분기 매출", "건수만 확인, 아직 적재 안 함"],
      ],
      method: ["구×업종별 3년 내 폐업률을 Spark SQL 집계로 계산해 서울 같은 업종과 비교", "개업 시기별 생존곡선을 Pair RDD(개월별 폐업·이탈 수)로 계산", "연도별 개업 수로 원천 업종 분류 이상을 자동 탐지", "업종·구·면적·개업 시기·주변 동종 업체 수로 3년 내 폐업 예측 (2015–19 학습, 2020–23 검증)"],
    },
    t3: {
      name: "빌라 전세 안심 체크", score: 85, badge: ["go", "의미 최고"],
      hookBig: "4건 중 1건", hook: "2024년 서울 빌라 전세 재계약 가운데 23.3%는 보증금을 내려야 했습니다(역전세).",
      persona: "민호 씨는 강서구 화곡동 빌라에 전세로 들어가려 합니다. 주변에서 “요즘 빌라 전세 무섭다”는 말을 들었습니다.",
      question: "이 동네 빌라, 보증금을 돌려받지 못할 신호가 있을까?",
      answer: "화곡동은 2025년 재계약의 <b>49.9%</b>가 보증금을 낮췄고(서울 11.5%), 보증금이 매매가의 80%를 넘는 계약이 <b>37.8%</b>(서울 23.8%)입니다. <b>‘위험 신호가 많은 동네’</b>입니다.",
      does: "서울 빌라 실거래 120만 건으로, 동네를 고르면 역전세 신호(재계약 보증금 하락)와 깡통전세 신호(보증금 ÷ 매매가)를 서울 평균과 비교해 판정합니다.",
      plus: ["2023~24년 역전세 급증, 강서구 집중이 데이터에서 바로 보임", "Spark 팩트체크 6개 모두 일치", "사회적 공감도가 가장 큼"],
      minus: ["종전 보증금은 2021년 이후 갱신 계약에만 있음", "같은 건물 매매가를 찾은 비율 58%", "등기부·임대인 정보 없음"],
      receipt: [
        ["국토부 연립다세대 전월세 실거래", "공공데이터포털 · RTMSDataSvcRHRent", "2019-01 ~ 2025-12, 서울 25개 구", "916,150", "보증금, 월세, 종전 보증금, 신규/갱신, 면적, 지번, 건물명", "종전 보증금은 갱신 계약에만 기록(2021년 이후)"],
        ["국토부 연립다세대 매매 실거래", "공공데이터포털 · RTMSDataSvcRHTrade", "2019-01 ~ 2025-12, 서울 25개 구", "284,090", "거래금액, 면적, 층, 건축연도, 지번, 건물명, 해제 여부", "계약 해제 13,155건(4.6%) 제외"],
        ["HUG 전세보증금반환보증 상세", "공공데이터포털 파일", "2016 ~", "6,906행", "월·주택유형·시도별 보증 건수·금액", "시도 단위라 동네 비교에는 못 씀 (외부 검증용)"],
      ],
      method: ["갱신 전세에서 새 보증금 < 종전 보증금인 비율 = 역전세 신호 (Spark SQL)", "건물 키(구·동·지번·건물명)로 전월세와 매매를 조인해 같은 건물 ㎡당 매매가 중앙값을 붙임", "보증금 ÷ 추정 매매가 = 전세가율 = 깡통전세 신호", "구·동별로 서울 평균과 비교해 신호등 판정"],
    },
    t2: {
      name: "빌라 투자 동네 비교", score: 79, badge: ["", "전세 탭에 붙이기"],
      hookBig: "최대 7배", hook: "같은 서울 빌라라도 동네에 따라 월세 수익률이 0.9%에서 6.7%까지 차이 납니다.",
      persona: "은행 PB 박 과장은 고객에게 “월세 받을 빌라를 관악구에서 산다면 어느 동네가 나을까”라는 질문을 받았습니다.",
      question: "관악구 안에서 월세 수익률이 괜찮고 시세보다 싸게 거래되는 동네는?",
      answer: "관악구 월세 수익률은 3.42%(서울 3.14%)이고, 봉천동(3.74%)·남현동(3.32%)·신림동(3.2%)이 수익률 서울 이상이면서 추정 시세보다 싸게 거래된 <b>후보 동</b>입니다.",
      does: "빌라 매매로 AI 추정 시세를 만들고, 같은 건물 월세 계약으로 수익률을 계산해 동네 순위를 보여 줍니다. 판정이 아니라 비교 도구입니다.",
      plus: ["전세 탭과 같은 데이터라 추가 수집 없음", "동네별 수익률 차이가 뚜렷함"],
      minus: ["추정 시세 오차 중앙값 14.3%라 개별 매물 판단 불가", "매매가는 추정값, 세금·공실을 뺀 수익률 아님", "‘집값 예측’은 흔한 주제"],
      receipt: [
        ["국토부 연립다세대 매매 실거래", "공공데이터포털 · RTMSDataSvcRHTrade", "2019-01 ~ 2025-12", "270,935 (해제 제외)", "거래금액, 면적, 대지면적, 층, 건축연도, 법정동", "법정동 331개가 모델 범주 한도(255) 초과 → 평균 단가로 변환"],
        ["국토부 연립다세대 전월세 실거래 (월세)", "공공데이터포털 · RTMSDataSvcRHRent", "2024 ~ 2025", "57,741 (수익률 계산 가능분)", "보증금, 월세, 면적, 건물 키", "같은 건물 매매가 없는 월세 계약은 계산 불가"],
      ],
      method: ["2019–2023 거래로 추정 시세 모델 학습, 2024–2025 거래로 검증 (sklearn과 Spark MLlib GBT 두 번)", "실제가 ÷ 추정가를 서울 전체 치우침(1.055배)으로 보정해 동네 비교", "월세 수익률 = 월세 × 12 ÷ (같은 건물 ㎡당 매매가 × 면적 − 보증금)"],
    },
    t5: {
      name: "못난이 적정가", score: 70.5, badge: ["stop", "보류 (KAMIS 대기)"],
      hookBig: "28%~60%", hook: "가락시장 하품 가격은 품목에 따라 특품의 28%(생표고)에서 60%(양파)까지 다릅니다.",
      persona: "반찬 공장 구매 담당 이 대리는 모양이 못난 양파를 싸게 사서 쓰고 싶습니다. 농가와 가격을 정해야 합니다.",
      question: "이번 주 양파 하품(20kg)은 얼마가 적정할까?",
      answer: "최근 특품 25,158원 × 최근 8주 가격비 76.7~83.7% = 하품 <b>19,300~21,100원</b>. 실제 최근 하품 거래가는 20,542원으로 범위 안이었습니다.",
      does: "가락시장 등급별 경락가로 품목마다 하품이 특품의 몇 %에 거래되는지 계산하고, 최근 특품 시세에서 하품 적정가 범위를 뽑습니다.",
      plus: ["못난이 적정가라는 새 지표", "애그테크 사업 이야기로 발표하기 좋음"],
      minus: ["기록의 34.6%가 전날 값 이월", "범위에 다음 주 값이 든 비율 32%", "누적 약 2년뿐, KAMIS 승인 대기"],
      receipt: [
        ["서울시 가락시장 품목·등급별 경락가", "서울 열린데이터 API · GarakGradePrice", "2024-08-28 ~ 2026-09-24", "503,023", "조사일, 품목, 등급(특·상·보통·하), 단위, 최고·최저·평균가", "34.6%가 전날과 같은 값(이월) → 제외 후 328,792건"],
        ["(대기) KAMIS 농산물 가격", "KAMIS Open API", "공식 안내 1996년 ~", "미확인", "도·소매 일별 가격", "인증 승인 대기"],
        ["(참고) aT 전국 도매시장 실시간 경매", "공공데이터포털 · katRealTime2", "최근 약 한 달", "하루 11~15만", "경매 건별", "과거가 남지 않아 지금부터 쌓아야 함"],
      ],
      method: ["윈도 함수(lag)로 전날과 같은 값을 찾아 이월로 보고 제외", "날짜×품목×단위별 하품/특품 가격비 계산", "최근 8주 가격비의 25~75% 범위 × 최근 특품 가격 = 적정가 범위", "과거로 돌아가 이 범위가 다음 주 값을 담았는지 검증 (7,792주)"],
    },
  };

  /* 과제 요구사항 × 주제. [상태, 근거] 상태: go 충족 · caution 보완 필요 · stop 부족 */
  const REQ = [
    ["대용량 누적 공개 데이터", "과제 요구 1", { t1: ["go", "68.6만 건, 수십 년 누적 (전국 295만 확인)"], t3: ["go", "120만 건, 2019~2025 (전국 2006~ 확인)"], t2: ["go", "매매 27만 건 + 월세"], t5: ["caution", "50만 건이지만 이월 제외 33만, 약 2년"] }],
    ["자동 수집 (API → 저장소)", "중간발표", { t1: ["go", "API 687회, 약 2.5분"], t3: ["go", "API 4,200회, 약 21분"], t2: ["go", "전세 탭과 공유"], t5: ["go", "API 504회, 약 40초"] }],
    ["빅데이터 형식으로 저장·관리", "과제 요구 1", "PIPE_STORE"],
    ["관리 효율 증명 (같은 질문, 저장 방식별 시간)", "최종 · 관리 깊이", "PIPE_QUERY"],
    ["Spark로 분석", "최종 · 관리 깊이", { t1: ["go", "Pair RDD 생존곡선, SQL 집계"], t3: ["go", "SQL 집계, 건물 키 조인"], t2: ["go", "MLlib GBT 회귀"], t5: ["go", "윈도 함수 lag, 피벗"] }],
    ["요약을 넘는 분석 (예측·추세·비교)", "과제 요구 2", { t1: ["go", "생존분석·지역 비교·폐업 예측"], t3: ["go", "역전세 추세·지역 비교"], t2: ["caution", "시세 예측 오차 14.3%"], t5: ["caution", "기준선 예측, 범위 적중 32%"] }],
    ["웹 서비스·시각화", "과제 요구 3", { t1: ["go", "판정·지도·생존곡선"], t3: ["go", "판정·지도·추세"], t2: ["go", "동네 순위표"], t5: ["go", "적정가 계산기"] }],
    ["예외 케이스·한계 처리", "최종 · 분석 깊이", { t1: ["go", "분류 이상 10개 조합 탐지"], t3: ["go", "해제 거래 제외, 결측 구간 명시"], t2: ["go", "해제 거래 제외, 추정 한계 명시"], t5: ["go", "이월 34.6% 제외"] }],
    ["문제 분석·디버깅 사례", "최종 평가 항목", { t1: ["go", "마포구 분류 이상 추적"], t3: ["go", "API 과다 호출(429) 대응"], t2: ["go", "범주 한도 오류 해결"], t5: ["go", "이월 값 발견"] }],
    ["데이터 팩트체크 (두 엔진 대조)", "완성도", "PIPE_FACT"],
    ["Sqoop·Flume 사용", "강의 4·9장", { t1: ["caution", "설계만 (실습 VM 필요)"], t3: ["caution", "설계만"], t2: ["caution", "설계만"], t5: ["caution", "설계만"] }],
    ["마감 안 확장 가능", "실현 가능성", { t1: ["go", "전국 약 3일"], t3: ["go", "전국 약 5일"], t2: ["go", "추가 수집 없음"], t5: ["caution", "KAMIS 승인에 달림"] }],
    ["차별성·흥미", "창의성", { t1: ["caution", "상권 분석과 겹칠 위험"], t3: ["go", "역전세·깡통전세, 공감도 높음"], t2: ["caution", "집값 예측은 흔함"], t5: ["go", "새로운 지표"] }],
  ];
  const ORDER = ["t1", "t3", "t2", "t5"];
  const WORD = { go: "충족", caution: "보완", stop: "부족" };
  const cell = ([s, t]) => `<td><span class="st ${s}">${WORD[s]}</span>${t}</td>`;

  function pipeCell(key, id, P) {
    const p = P && P.topics && P.topics[id === "t2" ? "t3" : id];
    if (!p) return ["caution", "측정 전"];
    if (key === "PIPE_STORE") {
      if (id === "t2") return ["go", "전세 탭 Parquet 공유"];
      return ["go", `Parquet ${p.partitions}개 파티션, ${p.csv_mb}MB → ${p.parquet_mb}MB`];
    }
    if (key === "PIPE_QUERY") {
      if (id === "t2") return ["go", "전세 탭과 공유"];
      return [p.query && p.query.same ? "go" : "caution", `CSV ${p.query.csv_s}초 → Parquet ${p.query.parquet_s}초`];
    }
    if (key === "PIPE_FACT") {
      const q = P.topics[id];
      if (!q) return ["caution", "측정 전"];
      const ok = q.checks.filter((c) => c.ok).length;
      const exact = q.checks.filter((c) => c.ok && c.site === c.spark).length;
      return [ok === q.checks.length ? "go" : "caution", exact === ok ? `${ok}/${q.checks.length} 일치` : `${ok}/${q.checks.length} 통과 (근접 ${ok - exact})`];
    }
  }

  function home(P) {
    document.getElementById("home-pitch").innerHTML = ORDER.map((id) => {
      const t = T[id];
      return `<a class="pitch" href="#${id}"><span class="pitch-rank">과제 적합도 <b>${t.score}</b>점 · <span class="st ${t.badge[0]}">${t.badge[1]}</span></span>
        <strong class="pitch-big">${t.hookBig}</strong><span class="pitch-hook">${t.hook}</span>
        <span class="pitch-name">${t.name}</span><span class="pitch-does">${t.does}</span>
        <span class="pitch-pm"><span><b>좋은 점</b> ${t.plus.join(" · ")}</span><span><b>걸리는 점</b> ${t.minus.join(" · ")}</span></span>
        <span class="pitch-go">자세히 보기</span></a>`;
    }).join("");
    document.getElementById("home-matrix").innerHTML = `<table class="matrix"><tr><th>과제 요구</th>${ORDER.map((id) => `<th>${T[id].name}</th>`).join("")}</tr>
      ${REQ.map(([name, src, v]) => `<tr><th scope="row">${name}<small>${src}</small></th>${ORDER.map((id) => cell(typeof v === "string" ? pipeCell(v, id, P) : v[id])).join("")}</tr>`).join("")}
      <tr class="sum"><th scope="row">충족 개수</th>${ORDER.map((id) => { const n = REQ.filter(([, , v]) => (typeof v === "string" ? pipeCell(v, id, P) : v[id])[0] === "go").length; return `<td><b>${n}</b> / ${REQ.length}</td>`; }).join("")}</tr></table>`;
  }

  function top(id) {
    const t = T[id];
    document.getElementById(`${id}-top`).innerHTML = `
      <p class="crumb">과제 적합도 <b>${t.score}</b>점 · <span class="st ${t.badge[0]}">${t.badge[1]}</span></p>
      <h1 class="t">${t.name}</h1>
      <p class="promise">${t.does}</p>
      <div class="scene"><div class="scene-q"><small>이런 사람이</small><p>${t.persona}</p><strong>“${t.question}”</strong></div>
        <div class="scene-a"><small>이 서비스의 답 (실데이터)</small><p>${t.answer}</p></div></div>
      <nav class="toc" aria-label="이 주제 안에서 이동"><a href="#${id}-demo-h">직접 써보기</a><a href="#${id}-fit">과제 요구 충족</a><a href="#${id}-pipe-h">전부 수행한 결과</a><a href="#${id}-fact-h">팩트체크</a><a href="#${id}-receipt-h">데이터 영수증</a><a href="#${id}-ev">지도·차트</a></nav>`;
  }

  function req(id, P) {
    document.getElementById(`${id}-req`).innerHTML = `<div class="tw"><table><tr><th>과제 요구</th><th>이 주제에서 한 일과 근거</th><th>상태</th></tr>
      ${REQ.map(([name, src, v]) => { const [s, txt] = typeof v === "string" ? pipeCell(v, id, P) : v[id]; return `<tr><td>${name}<br><span class="small">${src}</span></td><td>${txt}</td><td><span class="tag ${s}">${WORD[s]}</span></td></tr>`; }).join("")}
      </table></div>`;
  }

  function pipe(id, P) {
    const el = document.getElementById(`${id}-pipe`);
    const p = P && P.topics && P.topics[id === "t2" ? "t3" : id];
    if (!p) { el.innerHTML = '<div class="note">파이프라인 측정값이 아직 없습니다.</div>'; return; }
    const own = P.topics[id] || {};
    const secs = own.seconds || p.seconds;
    const stages = id === "t2" ? [
      ["수집", "전세 탭과 같은 API 적재분", "추가 호출 없음"],
      ["원본", `매매 ${fmt(own.raw_rows || 0)}건`, "CSV"],
      ["저장·관리", "t3_sale_contract (Parquet)", "연도·구 파티션 공유"],
      ["분석 (Spark)", `MLlib GBT 학습 ${fmt(own.train || 0)}건 → 검증 ${fmt(own.test || 0)}건`, `약 ${secs}초`],
      ["서비스", "동네 순위표", "직접 써보기"],
    ] : [
      ["수집", "공공 API → CSV", id === "t1" ? "687회 호출, 약 2.5분" : id === "t3" ? "4,200회 호출, 약 21분" : "504회 호출, 약 40초"],
      ["원본", `${fmt(p.raw_rows)}건`, `CSV ${p.csv_mb}MB`],
      ["저장·관리", `${p.table} (Parquet)`, `${p.partition_cols.join(" · ")} 파티션 ${p.partitions}개 · ${p.parquet_mb}MB (${Math.round((1 - p.parquet_mb / p.csv_mb) * 100)}% 작음)`],
      ["분석 (Spark)", T[id].method[0], `전체 약 ${secs}초`],
      ["서비스", "판정·지도·차트", "직접 써보기"],
    ];
    const q = p.query;
    const bar = q && id !== "t2" ? `<div class="qbar"><p><b>같은 질문, 저장 방식별 시간</b> “${q.desc}” (3회 중앙값, 결과 ${q.same ? "동일" : "다름"})</p>
      <div class="qrow"><span>CSV 전체 읽기</span><i style="width:${Math.min(100, (q.csv_s / Math.max(q.csv_s, q.parquet_s)) * 100)}%"></i><b>${q.csv_s}초</b></div>
      <div class="qrow"><span>Parquet 파티션</span><i class="pq" style="width:${Math.min(100, (q.parquet_s / Math.max(q.csv_s, q.parquet_s)) * 100)}%"></i><b>${q.parquet_s}초</b></div>
      <p class="small">한 PC의 로컬 Spark ${P.spark_version}로 잰 값입니다. 데이터가 수백 MB 수준이라 차이가 작습니다. 전국·장기 데이터로 커지면 파티션으로 읽지 않는 파일이 늘어 차이가 커집니다.</p></div>` : "";
    el.innerHTML = `<ol class="pipe">${stages.map(([a, b, c]) => `<li><b>${a}</b><span>${b}</span><small>${c}</small></li>`).join("")}</ol>${bar}
      <p class="small">분석 방법: ${T[id].method.join(" · ")}.<br>HDFS·Hive·Sqoop·Flume은 하둡 클러스터가 필요해 이 PC에서는 돌리지 않았습니다. 같은 Parquet 파티션을 실습 VM의 HDFS에 올리고 Hive 외부 테이블로 연결하면 그대로 이어집니다.</p>`;
  }

  function fact(id, P) {
    const el = document.getElementById(`${id}-fact`);
    const q = P && P.topics && P.topics[id];
    if (!q) { el.innerHTML = '<div class="note">팩트체크 결과가 아직 없습니다.</div>'; return; }
    const f = (c, v) => v === null || v === undefined ? "–" : c.fmt === "int" ? fmt(v) : (v * 100).toFixed(1) + "%";
    el.innerHTML = `<p>이 사이트의 숫자는 파이썬(pandas)으로 계산했습니다. 같은 원본을 <b>Spark ${P.spark_version}</b>로 따로 계산해 맞는지 대조했습니다.</p>
      <div class="tw"><table><tr><th>주장</th><th>사이트 값</th><th>Spark 재계산</th><th>결과</th></tr>
      ${q.checks.map((c) => `<tr><td>${c.claim}</td><td>${f(c, c.site)}</td><td>${f(c, c.spark)}</td><td>${c.ok && c.site === c.spark ? '<span class="tag go">일치</span>' : c.ok ? '<span class="tag go">근접</span> <span class="small">허용 범위 안</span>' : '<span class="tag caution">차이</span>'}</td></tr>`).join("")}</table></div>
      ${q.note ? `<p class="small">${q.note}</p>` : ""}`;
  }

  function receipt(id) {
    document.getElementById(`${id}-receipt`).innerHTML = `<div class="tw"><table><tr><th>데이터</th><th>출처</th><th>기간</th><th>건수</th><th>쓴 항목</th><th>품질 문제와 처리</th></tr>
      ${T[id].receipt.map((r) => `<tr>${r.map((x, i) => `<td${i === 3 ? ' class="num"' : ""}>${x}</td>`).join("")}</tr>`).join("")}</table></div>
      <p class="small">모두 2026-09-27에 인증키로 직접 호출해 받았습니다. 수집·분석 스크립트는 과제 폴더 api_verification/에 있습니다.</p>`;
  }

  async function renderTopic(id) {
    const P = await load("pipeline");
    top(id); req(id, P); pipe(id, P); fact(id, P); receipt(id);
  }
  async function renderHome() { home(await load("pipeline")); }
  return { renderTopic, renderHome };
})();
