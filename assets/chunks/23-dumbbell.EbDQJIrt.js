var e=`<!-- 哑铃 | y 写成 [下, 上] 是区间，棒棒糖形态两头各一个点：一眼看出每一项从哪里变到哪里 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-dumbbell">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各部门员工满意度（分）</figcaption>
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
  const chart = document.getElementById("cartesian-chart-dumbbell");
  // 上一期与本期的满意度：区间的两端就是两期
  const scores = [
    { dept: "研发", before: 68, after: 81 },
    { dept: "产品", before: 72, after: 78 },
    { dept: "设计", before: 75, after: 84 },
    { dept: "销售", before: 61, after: 66 },
    { dept: "客服", before: 58, after: 73 },
    { dept: "行政", before: 70, after: 72 },
  ];
  const series = [{ mark: "bar", x: "dept", y: ["before", "after"], shape: "lollipop", name: "满意度" }];
  chart.data = scores;
  chart.series = series;
  chart.orientation = "horizontal";
<\/script>
`;export{e as default};