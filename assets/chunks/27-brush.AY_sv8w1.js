const a=`<!-- 刷选 | brush 打开刷选：在绘图区里拖动框出一块，框外的点淡出，松手派发一次范围与框里的数据；点一下或按 Escape 清掉 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-brush">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">门店面积与月销售额</figcaption>
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
  const chart = document.getElementById("cartesian-chart-brush");
  // 60 家门店的面积（m²）与月销售额（万元），由序号算出，每次打开都长一样
  const stores = Array.from({ length: 60 }, (_, i) => {
    const area = Math.round(40 + (Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1) * 160);
    const sales = Math.round((area * 0.9 + ((Math.abs(Math.sin(i * 78.233) * 12345.678) % 1) - 0.5) * 60) * 10) / 10;
    return { area, sales };
  });
  const series = [{ mark: "scatter", x: "area", y: "sales", name: "门店" }];
  chart.data = stores;
  chart.series = series;
  chart.brush = "xy";
<\/script>
`;export{a as default};
