const n=`<!-- 线尾标签 | endLabel 把系列名与末值写在线尾，末端挨着时上下推开、用引导线连回线尾；折线不多时读者不用对照图例 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-end-label">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各端月活跃用户（千人）</figcaption>
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
  const chart = document.getElementById("cartesian-chart-end-label");
  chart.data = [
    { month: "一月", web: 820, ios: 540, android: 610 },
    { month: "二月", web: 760, ios: 580, android: 650 },
    { month: "三月", web: 910, ios: 640, android: 720 },
    { month: "四月", web: 880, ios: 700, android: 760 },
    { month: "五月", web: 950, ios: 760, android: 840 },
    { month: "六月", web: 1010, ios: 880, android: 900 },
  ];
  chart.series = [
    { mark: "line", x: "month", y: "web", name: "网页", endLabel: true },
    { mark: "line", x: "month", y: "ios", name: "iOS", endLabel: true },
    { mark: "line", x: "month", y: "android", name: "Android", endLabel: true },
  ];
<\/script>
`;export{n as default};
