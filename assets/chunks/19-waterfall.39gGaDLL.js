var e=`<!-- 瀑布 | waterfall 让每一步接在上一步的累计值上，涨跌分色；total 为真的行是小计，从 0 画到累计值 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-waterfall">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本季利润构成（万元）</figcaption>
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
  const chart = document.getElementById("cartesian-chart-waterfall");
  chart.data = [
    { item: "营收", amount: 820 },
    { item: "成本", amount: -410 },
    { item: "毛利", total: true },
    { item: "销售", amount: -120 },
    { item: "研发", amount: -95 },
    { item: "其他收益", amount: 36 },
    { item: "净利", total: true },
  ];
  chart.series = [{ mark: "bar", x: "item", y: "amount", name: "利润（万元）", waterfall: { total: "total" }, labels: "end" }];
<\/script>
`;export{e as default};