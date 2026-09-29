const t=`<!-- 靠左对齐 | align="start" 让阶段靠起始边对齐，逐级缩短看得更清楚 -->
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-start" name-field="stage" value-field="users" align="start" shape="bar">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">招聘流程</figcaption>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-funnel-chart>
</div>

<script type="module">
  const chart = document.getElementById("funnel-chart-start");
  const steps = [
    { stage: "收到简历", users: 860 },
    { stage: "简历通过", users: 310 },
    { stage: "一面", users: 150 },
    { stage: "二面", users: 64 },
    { stage: "发放录用", users: 18 },
  ];
  chart.data = steps;
<\/script>
`;export{t as default};
