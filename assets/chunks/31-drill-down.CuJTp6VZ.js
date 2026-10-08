var e=`<!-- 下钻 | onDatumPress 接住点下的那根柱（Enter / Space 同样）：换成这个地区按月的数据，旁边放一个按钮回到全部地区 -->
<div style="display: grid; gap: var(--xh-space-3); justify-items: start; width: 100%">
  <xh-button id="cartesian-chart-drill-back" variant="subtle" disabled>
    <button data-xh-part="root">返回全部地区</button>
  </xh-button>
  <xh-cartesian-chart id="cartesian-chart-drill" style="width: 100%">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各地区销售额（点一根柱查看按月）</figcaption>
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
  const chart = document.getElementById("cartesian-chart-drill");
  const back = document.getElementById("cartesian-chart-drill-back");
  const caption = chart.querySelector('[data-xh-part="caption"]');
  const regions = [
    { region: "华东", amount: 4820 },
    { region: "华南", amount: 3960 },
    { region: "华北", amount: 3120 },
    { region: "西部", amount: 1780 },
  ];
  const months = ["一月", "二月", "三月", "四月", "五月", "六月"];

  // 一个地区六个月的销售额：按地区合计与月份算出，每次打开都一样
  function monthsOf(region) {
    const total = regions.find(r => r.region === region).amount;
    return months.map((month, i) => ({ month, amount: Math.round(total / 6 * (0.8 + 0.08 * i)) }));
  }

  // null 是全部地区；点下一根柱就换成那个地区
  let region = null;
  function show(next) {
    region = next;
    chart.data = region ? monthsOf(region) : regions;
    chart.series = region
      ? [{ mark: "bar", x: "month", y: "amount", name: \`\${region}销售额\` }]
      : [{ mark: "bar", x: "region", y: "amount", name: "销售额" }];
    caption.textContent = region ? \`\${region} · 按月\` : "各地区销售额（点一根柱查看按月）";
    back.disabled = !region;
  }

  chart.addEventListener("datum-press", (event) => {
    if (!region)
      show(String(event.detail.key));
  });
  back.addEventListener("click", () => show(null));
  show(null);
<\/script>
`;export{e as default};