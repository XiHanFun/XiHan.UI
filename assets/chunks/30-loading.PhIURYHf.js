const n=`<!-- 加载态 | pending 表示正在取数：首次还没有数据时空态写「加载中」并转圈，之后重取时保留上一帧、整体变淡，取回来再过渡到新值 -->
<div style="display: grid; gap: var(--xh-space-3); justify-items: start; width: 100%">
  <xh-button id="cartesian-chart-loading-refresh" variant="subtle">
    <button data-xh-part="root">刷新</button>
  </xh-button>
  <xh-cartesian-chart id="cartesian-chart-loading" style="width: 100%">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">月度销售额</figcaption>
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
  const chart = document.getElementById("cartesian-chart-loading");
  const refresh = document.getElementById("cartesian-chart-loading-refresh");
  // 两批数据轮流取回，模拟每次刷新拿到的新结果
  const batches = [
    [
      { month: "一月", amount: 1204 },
      { month: "二月", amount: 986 },
      { month: "三月", amount: 1530 },
      { month: "四月", amount: 1382 },
      { month: "五月", amount: 1745 },
      { month: "六月", amount: 1618 },
    ],
    [
      { month: "一月", amount: 1310 },
      { month: "二月", amount: 1120 },
      { month: "三月", amount: 1480 },
      { month: "四月", amount: 1600 },
      { month: "五月", amount: 1705 },
      { month: "六月", amount: 1890 },
    ],
  ];
  chart.series = [{ mark: "bar", x: "month", y: "amount", name: "销售额" }];

  let turn = 0;
  function load() {
    chart.pending = true;
    refresh.disabled = true;
    setTimeout(() => {
      chart.data = batches[turn++ % batches.length];
      chart.pending = false;
      refresh.disabled = false;
    }, 1000);
  }

  refresh.addEventListener("click", load);
  load();
<\/script>
`;export{n as default};
