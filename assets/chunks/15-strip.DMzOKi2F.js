const t=`<!-- 类目上的分布 | 散点落在类目轴上时用 jitter 左右散开，看每个类目里的点怎么分布，而不是叠成一条竖线 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-strip">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各天的接口响应时间</figcaption>
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
  const chart = document.getElementById("cartesian-chart-strip");
  // 一周五天、每天 16 次接口的响应时间，由序号算出，每次打开都长一样
  function noise(i) {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  const days = ["周一", "周二", "周三", "周四", "周五"];
  chart.data = days.flatMap((day, d) =>
    Array.from({ length: 16 }, (_, i) => ({
      day,
      ms: Math.round(120 + d * 18 + noise(d * 16 + i) ** 2 * 260),
    })),
  );
  chart.series = [{ mark: "scatter", x: "day", y: "ms", name: "响应时间", jitter: 0.6 }];
  chart.yAxis = { title: "毫秒" };
<\/script>
`;export{t as default};
