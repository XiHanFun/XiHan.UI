const t=`<!-- 直方图 | 柱的 x 写成 [起, 止] 分箱区间，柱按区间的真实宽度画在数值轴上；分箱用 @xihan-ui/viz 的 bin() 或后端算好 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-histogram">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">请求耗时分布</figcaption>
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
  const chart = document.getElementById("cartesian-chart-histogram");
  // 200 次请求的耗时，由序号算出，每次打开都长一样
  function noise(i) {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  const samples = Array.from({ length: 200 }, (_, i) => Math.round(80 + (noise(i) + noise(i + 500) + noise(i + 900)) * 60));
  // 每 20 毫秒一箱；高尾合成一箱，宽度照实画出
  const edges = [80, 100, 120, 140, 160, 180, 200, 220, 260];
  chart.data = edges.slice(0, -1).map((from, i) => ({
    from,
    to: edges[i + 1],
    count: samples.filter(v => v >= from && (i === edges.length - 2 ? v <= edges[i + 1] : v < edges[i + 1])).length,
  }));
  chart.series = [{ mark: "bar", x: ["from", "to"], y: "count", name: "请求数" }];
  chart.xAxis = { title: "耗时（毫秒）" };
<\/script>
`;export{t as default};
