const t=`<!-- 实时行情流 | 列式数据仓 append 新成交，同一帧里的多次推送合成一次重画；窗口跟着最新价走，拖离末端即暂停，受控的 follow 一键回到最新 -->
<div style="display: grid; gap: var(--xh-space-3); justify-items: start; width: 100%">
  <xh-button id="cartesian-chart-trades-latest" variant="subtle" disabled>
    <button data-xh-part="root">回到最新</button>
  </xh-button>
  <xh-cartesian-chart id="cartesian-chart-trades" zoom="x" follow style="width: 100%">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">BTC/USDT 逐笔成交</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="zoom-slider"></div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-cartesian-chart>
</div>

<script type="module">
  import { createColumnStore } from "@xihan-ui/web-components";

  // 最多留两万笔成交，更早的从头部挤掉；价格是确定的随机游走，每次打开都长一样
  const trades = createColumnStore({ fields: ["t", "price"], capacity: 20000 });
  let seed = 7;
  let price = 62000;
  let time = Date.UTC(2026, 8, 1);
  function trade() {
    seed = (seed * 16807) % 2147483647;
    price += (seed / 2147483647 - 0.5) * 40;
    time += 500;
    trades.append({ t: time, price });
  }
  for (let i = 0; i < 5000; i++)
    trade();

  const chart = document.getElementById("cartesian-chart-trades");
  const latest = document.getElementById("cartesian-chart-trades-latest");
  // 初始窗口是最近十分钟
  chart.defaultWindow = { x: [new Date(time - 10 * 60_000), new Date(time)], y: null };
  chart.data = trades;
  chart.series = [{ mark: "line", x: "t", y: "price", name: "BTC/USDT" }];
  chart.xAxis = { scale: "time" };
  chart.yAxis = { fit: "window" };
  chart.annotations = [{ kind: "point", series: "price", at: "last" }];

  // 拖动、滚轮或键盘让窗口离开末端时 follow 变 false；写回元素才生效，按钮再把它写回 true
  chart.addEventListener("follow-change", (event) => {
    chart.follow = event.detail.follow;
    latest.disabled = event.detail.follow;
  });
  latest.addEventListener("click", () => {
    chart.follow = true;
    latest.disabled = true;
  });

  // 每 100 ms 到五笔：图表按帧合并，不是每笔重画一次；图表被移出文档就收手
  const timer = window.setInterval(() => {
    if (!chart.isConnected) {
      window.clearInterval(timer);
      return;
    }
    for (let i = 0; i < 5; i++)
      trade();
  }, 100);
<\/script>
`;export{t as default};
