const n=`<!-- 各圈的数值 | ring-labels 在 12 点方向那根轴上写出每一圈的数值，rings 定圈数；只在各指标量程相同时写 -->
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-ring-labels" name-field="name" scale="shared" rings="5" ring-labels>
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
  const chart = document.getElementById("radar-chart-ring-labels");
  // 六项能力都是 0–100 分：同一种单位，适合共用量程
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
