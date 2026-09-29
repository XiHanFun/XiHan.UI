const a=`<!-- 区间带 | 折线的 y 写成 [下, 上] 只铺一条带：预测值的上下限画成带，实际值照常画成线 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-band">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">周订单量与预测（千单）</figcaption>
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
  const chart = document.getElementById("cartesian-chart-band");
  // 前八周是实际值，后四周是预测值与它的上下限
  const weeks = [
    { week: "W1", actual: 42 },
    { week: "W2", actual: 45 },
    { week: "W3", actual: 44 },
    { week: "W4", actual: 48 },
    { week: "W5", actual: 51 },
    { week: "W6", actual: 50 },
    { week: "W7", actual: 54 },
    { week: "W8", actual: 56, forecast: 56, low: 56, high: 56 },
    { week: "W9", forecast: 58, low: 55, high: 61 },
    { week: "W10", forecast: 60, low: 55, high: 65 },
    { week: "W11", forecast: 61, low: 54, high: 68 },
    { week: "W12", forecast: 63, low: 54, high: 72 },
  ];
  // 区间带先声明，压在线的下面
  const series = [
    { mark: "line", x: "week", y: ["low", "high"], name: "预测区间" },
    { mark: "line", x: "week", y: "actual", name: "实际" },
    { mark: "line", x: "week", y: "forecast", name: "预测" },
  ];
  chart.data = weeks;
  chart.series = series;
<\/script>
`;export{a as default};
