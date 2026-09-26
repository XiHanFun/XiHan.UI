const n=`<!-- 数据更新 | 换一组数据时柱从当前高度走到新高度，柱端的数随之滚动；关掉动画后直接画终态 -->
<div style="display: grid; gap: var(--xh-space-4); width: 100%">
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-4)">
    <xh-button id="cartesian-chart-transition-next">
      <button data-xh-part="root">换一组数据</button>
    </xh-button>
    <label style="display: flex; align-items: center; gap: var(--xh-space-2)">
      <xh-switch id="cartesian-chart-transition-animated" default-checked>
        <button data-xh-part="root">
          <span data-xh-part="thumb"></span>
        </button>
      </xh-switch>
      动画
    </label>
  </div>
  <xh-cartesian-chart id="cartesian-chart-transition">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption" id="cartesian-chart-transition-caption"></figcaption>
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
  const chart = document.getElementById("cartesian-chart-transition");
  const caption = document.getElementById("cartesian-chart-transition-caption");
  const months = ["一月", "二月", "三月", "四月", "五月", "六月"];
  const years = [
    { year: 2024, online: [82, 96, 110, 104, 128, 140], store: [64, 70, 66, 72, 80, 78] },
    { year: 2025, online: [120, 132, 118, 150, 162, 176], store: [70, 62, 74, 68, 76, 82] },
    { year: 2026, online: [150, 144, 170, 186, 172, 204], store: [58, 66, 60, 54, 62, 70] },
  ];
  let index = 0;

  // 同一批月份、不同的数：柱按月份对上，原地伸缩
  function show() {
    const current = years[index];
    caption.textContent = \`\${current.year} 年上半年销售额（万元）\`;
    chart.data = months.map((month, i) => ({ month, online: current.online[i], store: current.store[i] }));
  }

  chart.series = [
    { mark: "bar", x: "month", y: "online", name: "线上", labels: "end" },
    { mark: "bar", x: "month", y: "store", name: "门店", labels: "end" },
  ];
  show();
  document.getElementById("cartesian-chart-transition-next").addEventListener("click", () => {
    index = (index + 1) % years.length;
    show();
  });
  document.getElementById("cartesian-chart-transition-animated").addEventListener("checked-change", (event) => {
    chart.animated = event.detail.checked;
  });
<\/script>
`;export{n as default};
