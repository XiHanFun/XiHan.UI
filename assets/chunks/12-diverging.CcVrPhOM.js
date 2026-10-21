var e=`<!-- 发散色阶 | 数据里有负数时以 0 为中点分两侧着色：相关系数矩阵，负相关与正相关各走一种颜色 -->
<!-- 对照条从负向满档经中点排到正向满档，两端文字是两侧最远的数 -->
<xh-heatmap id="heatmap-diverging" variant="matrix">
  <div data-xh-part="root" style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px"></div>
</xh-heatmap>

<script type="module">
  // 对角线是自己和自己，恒为 1；其余两两之间在 ±1 之间
  const heatmap = document.getElementById("heatmap-diverging");
  heatmap.rows = ["时长", "页数", "跳出", "转化"];
  heatmap.columns = ["时长", "页数", "跳出", "转化"];
  heatmap.value = [
    { row: "时长", column: "时长", value: 1 },
    { row: "时长", column: "页数", value: 0.72 },
    { row: "时长", column: "跳出", value: -0.65 },
    { row: "时长", column: "转化", value: 0.41 },
    { row: "页数", column: "时长", value: 0.72 },
    { row: "页数", column: "页数", value: 1 },
    { row: "页数", column: "跳出", value: -0.58 },
    { row: "页数", column: "转化", value: 0.36 },
    { row: "跳出", column: "时长", value: -0.65 },
    { row: "跳出", column: "页数", value: -0.58 },
    { row: "跳出", column: "跳出", value: 1 },
    { row: "跳出", column: "转化", value: -0.47 },
    { row: "转化", column: "时长", value: 0.41 },
    { row: "转化", column: "页数", value: 0.36 },
    { row: "转化", column: "跳出", value: -0.47 },
    { row: "转化", column: "转化", value: 1 },
  ];
<\/script>
`;export{e as default};