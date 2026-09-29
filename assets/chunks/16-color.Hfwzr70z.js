const t=`<!-- 按值着色 | color 把第三个量映射到顺序色阶，图例末尾多一条色阶；palette 把色阶换到别的色相上 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-color" palette="teal">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各监测点的 PM2.5</figcaption>
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
  const chart = document.getElementById("cartesian-chart-color");
  // 一片区域里 60 个监测点的位置与 PM2.5 读数，由序号算出，每次打开都长一样
  function noise(i) {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  chart.data = Array.from({ length: 60 }, (_, i) => {
    const east = Math.round(noise(i) * 100);
    const north = Math.round(noise(i + 60) * 100);
    const pm = Math.round(20 + (east + north) * 0.6 + noise(i + 120) * 30);
    return { east, north, pm };
  });
  chart.series = [{ mark: "scatter", x: "east", y: "north", color: "pm", name: "监测点" }];
  chart.xAxis = { title: "向东（千米）" };
  chart.yAxis = { title: "向北（千米）" };
  chart.translations = { colorLabel: "PM2.5" };
<\/script>
`;export{t as default};
