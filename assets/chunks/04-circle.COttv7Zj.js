const n=`<!-- 圆形网格 | shape="circle" 把网格画成同心圆：指标多、多边形的折角显得杂乱时更安静 -->
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-circle" name-field="name" shape="circle">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">两名工程师的能力评估</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-radar-chart>
</div>

<script type="module">
  const chart = document.getElementById("radar-chart-circle");
  const people = [
    { name: "张三", design: 85, frontend: 92, backend: 60, testing: 70, communication: 78, planning: 66 },
    { name: "李四", design: 58, frontend: 70, backend: 90, testing: 82, communication: 64, planning: 80 },
  ];
  const indicators = [
    { key: "design", label: "设计" },
    { key: "frontend", label: "前端" },
    { key: "backend", label: "后端" },
    { key: "testing", label: "测试" },
    { key: "communication", label: "沟通" },
    { key: "planning", label: "规划" },
  ];
  chart.data = people;
  chart.indicators = indicators;
<\/script>
`;export{n as default};
