var e=`<!-- 气泡 | size 把第三个量映射到点的面积：面积与数值成正比，读的是大小之比而不是半径之比 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-bubble">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">收入、通勤与城市规模</figcaption>
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
  const chart = document.getElementById("cartesian-chart-bubble");
  chart.data = [
    { city: "甲", income: 9.2, commute: 48, population: 2180 },
    { city: "乙", income: 8.4, commute: 45, population: 1870 },
    { city: "丙", income: 7.1, commute: 38, population: 1290 },
    { city: "丁", income: 6.5, commute: 41, population: 1530 },
    { city: "戊", income: 5.8, commute: 33, population: 940 },
    { city: "己", income: 5.2, commute: 29, population: 620 },
    { city: "庚", income: 4.6, commute: 31, population: 780 },
    { city: "辛", income: 3.9, commute: 26, population: 410 },
  ];
  chart.series = [{ mark: "scatter", x: "income", y: "commute", size: "population", name: "城市", datumId: "city" }];
  chart.xAxis = { title: "人均年收入（万元）" };
  chart.yAxis = { title: "平均通勤（分钟）" };
  chart.translations = { sizeLabel: "人口（万）" };
<\/script>
`;export{e as default};