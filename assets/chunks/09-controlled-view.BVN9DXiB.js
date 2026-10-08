var e=`<!-- 同步平移缩放 | 两张图接到同一份受控的 view：在任一张上缩放、平移，另一张跟着到同一处，对照着看两个时段 -->
<div style="display: grid; gap: var(--xh-space-6); width: 100%">
  <xh-graph-chart id="graph-chart-view-last" layout="preset" zoom="true">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">上周的链路</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-graph-chart>
  <xh-graph-chart id="graph-chart-view-this" layout="preset" zoom="true">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本周的链路</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-graph-chart>
</div>

<script type="module">
  const last = document.getElementById("graph-chart-view-last");
  const current = document.getElementById("graph-chart-view-this");
  const devices = [
    { id: "wan", name: "公网", group: "出口", x: 300, y: 0 },
    { id: "fw", name: "防火墙", group: "出口", x: 300, y: 70 },
    { id: "core-a", name: "核心 A", group: "核心", x: 180, y: 150 },
    { id: "core-b", name: "核心 B", group: "核心", x: 420, y: 150 },
    { id: "acc-1", name: "接入 1", group: "接入", x: 60, y: 250 },
    { id: "acc-2", name: "接入 2", group: "接入", x: 240, y: 250 },
    { id: "acc-3", name: "接入 3", group: "接入", x: 360, y: 250 },
    { id: "acc-4", name: "接入 4", group: "接入", x: 540, y: 250 },
  ];
  // 两个时段的链路：上周核心 B 还挂在核心 A 下面
  const lastWeek = [
    { source: "wan", target: "fw" },
    { source: "fw", target: "core-a" },
    { source: "core-a", target: "core-b" },
    { source: "core-a", target: "acc-1" },
    { source: "core-a", target: "acc-2" },
    { source: "core-b", target: "acc-3" },
    { source: "core-a", target: "acc-4" },
  ];
  const thisWeek = [
    { source: "wan", target: "fw" },
    { source: "fw", target: "core-a" },
    { source: "fw", target: "core-b" },
    { source: "core-a", target: "acc-1" },
    { source: "core-a", target: "acc-2" },
    { source: "core-b", target: "acc-3" },
    { source: "core-b", target: "acc-4" },
  ];
  last.nodes = devices;
  last.links = lastWeek;
  current.nodes = devices;
  current.links = thisWeek;

  // 一份视图两张图共用：写回之后两张图一起动
  const home = { k: 1, x: 0, y: 0 };
  last.view = home;
  current.view = home;
  for (const chart of [last, current]) {
    chart.addEventListener("view-change", (event) => {
      last.view = event.detail.view;
      current.view = event.detail.view;
    });
  }
<\/script>
`;export{e as default};