const n=`<!-- 多系列折线 | 三条折线共用坐标轴，图例点一下隐藏或恢复一个系列，其余系列颜色不变 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-lines">
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
  const chart = document.getElementById("cartesian-chart-lines");
  chart.data = [
    { month: "1月", web: 820, ios: 540, android: 610 },
    { month: "2月", web: 760, ios: 580, android: 650 },
    { month: "3月", web: 910, ios: 640, android: 720 },
    { month: "4月", web: 880, ios: 700, android: 760 },
    { month: "5月", web: 950, ios: 760, android: 840 },
    { month: "6月", web: 1010, ios: 830, android: 900 },
    { month: "7月", web: 970, ios: 880, android: 960 },
    { month: "8月", web: 1040, ios: 920, android: 1010 },
  ];
  // 系列的 id 缺省取 y 的字段名；name 是图例与提示框里的字
  chart.series = [
    { mark: "line", x: "month", y: "web", name: "网页" },
    { mark: "line", x: "month", y: "ios", name: "iOS" },
    { mark: "line", x: "month", y: "android", name: "Android" },
  ];
<\/script>
`;export{n as default};
