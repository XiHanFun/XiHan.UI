const t=`<!-- 缩放 | zoom 打开自变量轴的缩放：按住 Ctrl（⌘）滚轮以指针为中心缩放，放大后拖动平移，缩放条拖两端改窗口；点多时按像素降采样 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-zoom">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">全年日访问量</figcaption>
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
  const chart = document.getElementById("cartesian-chart-zoom");
  // 一整年的日访问量，由日序号算出，每次打开都长一样
  const visits = Array.from({ length: 365 }, (_, i) => ({
    date: new Date(2026, 0, 1 + i),
    visits: Math.round(3200 + i * 6 + Math.sin(i / 7) * 420 + Math.sin(i / 29) * 650),
  }));
  const series = [{ mark: "line", x: "date", y: "visits", name: "访问量", symbols: "none" }];
  chart.data = visits;
  chart.series = series;
  chart.zoom = "x";
<\/script>
`;export{t as default};
