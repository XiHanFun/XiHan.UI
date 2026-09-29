const t=`<!-- 对称对数轴 | yAxis.scale 写 symlog：长尾数据跨越正负、含 0 也画得出，0 附近铺得开、尾部压得住；还有 sqrt 与 pow（指数写 exponent） -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-symlog">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各仓库本周库存变化（件）</figcaption>
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
  const chart = document.getElementById("cartesian-chart-symlog");
  const changes = [
    { store: "华北", delta: -1800 },
    { store: "华东", delta: -40 },
    { store: "华中", delta: 0 },
    { store: "华南", delta: 12 },
    { store: "西南", delta: 260 },
    { store: "西北", delta: 9600 },
  ];
  const series = [{ mark: "bar", x: "store", y: "delta", name: "库存变化" }];
  // 对称对数：线性轴上 9600 会把其余几根压成一条线，对数轴又画不了负数与 0
  const yAxis = { scale: "symlog" };
  chart.data = changes;
  chart.series = series;
  chart.yAxis = yAxis;
<\/script>
`;export{t as default};
