const n=`<!-- 趋势线 | trend 画移动平均或最小二乘直线：看的是走向，不是某一天的起伏 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-trend">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本月日活</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-cartesian-chart>
</div>

<script type="module">
  const chart = document.getElementById("cartesian-chart-trend");
  // 30 天的日活，由序号算出，每次打开都长一样
  function noise(i) {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  chart.data = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    active: Math.round(1200 + i * 18 + (noise(i) - 0.5) * 320),
  }));
  chart.series = [{ mark: "line", x: "day", y: "active", name: "日活", symbols: "none" }];
  // 移动平均抹平日间的起伏；直线看整个月是涨是跌
  chart.annotations = [
    { kind: "trend", series: "active", method: "moving-average", window: 7, label: "7 日均线" },
    { kind: "trend", series: "active", method: "linear" },
  ];
  chart.xAxis = { title: "日" };
<\/script>
`;export{n as default};
