const t=`<!-- 刷选联动 | onBrushSelectionChange 交出框里的数据：旁边的统计跟着框走，清掉框就回到全部门店 -->
<div style="display: grid; gap: var(--xh-space-3); width: 100%">
  <xh-cartesian-chart id="cartesian-chart-brush-linked" brush="xy">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">门店面积与月销售额（拖动框选）</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-cartesian-chart>
  <p id="cartesian-chart-brush-linked-stats" aria-live="polite" style="margin: 0"></p>
</div>

<script type="module">
  const chart = document.getElementById("cartesian-chart-brush-linked");
  const stats = document.getElementById("cartesian-chart-brush-linked-stats");
  // 60 家门店的面积（m²）与月销售额（万元），由序号算出，每次打开都长一样
  const stores = Array.from({ length: 60 }, (_, i) => {
    const area = Math.round(40 + (Math.abs(Math.sin(i * 12.9898) * 43758.5453) % 1) * 160);
    const sales = Math.round((area * 0.9 + ((Math.abs(Math.sin(i * 78.233) * 12345.678) % 1) - 0.5) * 60) * 10) / 10;
    return { area, sales };
  });
  chart.data = stores;
  chart.series = [{ mark: "scatter", x: "area", y: "sales", name: "门店" }];

  // 一组门店的家数与平均月销售额
  function statsOf(rows) {
    const average = rows.reduce((sum, row) => sum + row.sales, 0) / Math.max(1, rows.length);
    return \`\${rows.length} 家门店，平均月销售额 \${average.toFixed(1)} 万元\`;
  }

  // 框里的门店；清掉框时回到全部
  chart.addEventListener("brush-selection-change", (event) => {
    const { selection, data } = event.detail;
    stats.textContent = selection ? \`框选了 \${statsOf(data.map(item => item.datum))}\` : \`全部 \${statsOf(stores)}\`;
  });
  stats.textContent = \`全部 \${statsOf(stores)}\`;
<\/script>
`;export{t as default};
