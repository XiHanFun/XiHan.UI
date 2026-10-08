var e=`<!-- 箱线与小提琴 | mark: 'boxplot' 按 x 分组统计原始值，画出中位数、四分位与离群点；style="violin" 画分布的轮廓 -->
<div style="display: grid; gap: var(--xh-space-4); width: 100%">
  <label style="display: flex; align-items: center; gap: var(--xh-space-2)">
    <xh-switch id="cartesian-chart-boxplot-toggle">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    小提琴
  </label>
  <xh-cartesian-chart id="cartesian-chart-boxplot">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各机房请求耗时</figcaption>
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
  const chart = document.getElementById("cartesian-chart-boxplot");
  // 三个机房各 60 次请求的耗时，由序号算出，每次打开都长一样
  function noise(i) {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  const rooms = ["北京", "上海", "广州"];
  chart.data = rooms.flatMap((room, r) =>
    Array.from({ length: 60 }, (_, i) => ({
      room,
      ms: Math.round(90 + r * 25 + (noise(r * 60 + i) + noise(r * 60 + i + 500)) * (40 + r * 20) + (i % 23 === 0 ? 180 : 0)),
    })),
  );
  const seriesOf = violin => [{ mark: "boxplot", x: "room", y: "ms", name: "耗时", style: violin ? "violin" : "box" }];
  chart.series = seriesOf(false);
  chart.yAxis = { title: "毫秒" };
  document.getElementById("cartesian-chart-boxplot-toggle").addEventListener("checked-change", (event) => {
    chart.series = seriesOf(event.detail.checked);
  });
<\/script>
`;export{e as default};