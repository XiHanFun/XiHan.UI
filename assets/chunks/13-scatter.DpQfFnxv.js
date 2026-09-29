const t=`<!-- 散点 | 每行一个点，看两个量有没有关系、点在哪里扎堆；两个系列的点形状也不同 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-scatter">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">学习时长与成绩</figcaption>
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
  const chart = document.getElementById("cartesian-chart-scatter");
  // 两个班各 20 名学生的每周学习时长与成绩，由序号算出，每次打开都长一样
  function noise(i) {
    const x = Math.sin(i * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  chart.data = Array.from({ length: 40 }, (_, i) => {
    const hours = Math.round((2 + noise(i) * 12) * 10) / 10;
    const score = Math.round(50 + hours * 3 + (i % 2 ? 6 : 0) + (noise(i + 100) - 0.5) * 20);
    return i % 2 ? { hours, second: score } : { hours, first: score };
  });
  // 一个班一个系列：y 字段缺失的行不属于这个系列
  chart.series = [
    { mark: "scatter", x: "hours", y: "first", name: "一班" },
    { mark: "scatter", x: "hours", y: "second", name: "二班" },
  ];
  chart.xAxis = { title: "每周学习时长（小时）" };
  chart.yAxis = { title: "成绩" };
<\/script>
`;export{t as default};
