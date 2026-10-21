var e=`<!-- 按下下钻 | 点一格或焦点在格上按 Enter，报告那一格：据此打开明细 -->
<xh-heatmap id="heatmap-press" variant="matrix">
  <div data-xh-part="root" style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px"></div>
</xh-heatmap>
<p id="heatmap-press-output" data-demo-output aria-live="polite">点一格查看明细</p>

<script type="module">
  const heatmap = document.getElementById("heatmap-press");
  heatmap.rows = ["周一", "周二", "周三"];
  heatmap.columns = ["上午", "下午", "夜里"];
  heatmap.value = [
    { row: "周一", column: "上午", value: 12 },
    { row: "周一", column: "下午", value: 30 },
    { row: "周一", column: "夜里", value: 8 },
    { row: "周二", column: "上午", value: 26 },
    { row: "周二", column: "下午", value: 18 },
    { row: "周二", column: "夜里", value: 4 },
    { row: "周三", column: "上午", value: 6 },
    { row: "周三", column: "下午", value: 34 },
    { row: "周三", column: "夜里", value: 15 },
  ];

  // 载荷与详情同源：行、列、写好的数值与档位都在里面，不必回头查数据
  const output = document.getElementById("heatmap-press-output");
  heatmap.addEventListener("datum-press", (event) => {
    const { row, column, formatted } = event.detail;
    output.textContent = \`\${row} \${column}：\${formatted.value} 单\`;
  });
<\/script>
`;export{e as default};