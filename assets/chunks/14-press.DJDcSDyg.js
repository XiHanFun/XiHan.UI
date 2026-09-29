const a=`<!-- 按下下钻 | 点一格或焦点在格上按 Enter，报告那一格：据此打开明细 -->
<div style="display: grid; gap: var(--xh-space-3); justify-items: start">
  <xh-heatmap id="heatmap-press" variant="matrix">
    <div data-xh-part="root" style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px">
      <div data-xh-part="grid">
        <div data-xh-part="row">
          <span data-xh-part="row-label"></span>
          <span data-xh-part="column-label" value="上午">上午</span>
          <span data-xh-part="column-label" value="下午">下午</span>
          <span data-xh-part="column-label" value="夜里">夜里</span>
        </div>
        <div data-xh-part="row" value="周一">
          <span data-xh-part="row-label" value="周一">周一</span>
          <div data-xh-part="cell" value="上午"></div>
          <div data-xh-part="cell" value="下午"></div>
          <div data-xh-part="cell" value="夜里"></div>
        </div>
        <div data-xh-part="row" value="周二">
          <span data-xh-part="row-label" value="周二">周二</span>
          <div data-xh-part="cell" value="上午"></div>
          <div data-xh-part="cell" value="下午"></div>
          <div data-xh-part="cell" value="夜里"></div>
        </div>
        <div data-xh-part="row" value="周三">
          <span data-xh-part="row-label" value="周三">周三</span>
          <div data-xh-part="cell" value="上午"></div>
          <div data-xh-part="cell" value="下午"></div>
          <div data-xh-part="cell" value="夜里"></div>
        </div>
      </div>
      <div data-xh-part="legend">
        <span data-xh-part="legend-label" value="low">少</span>
        <span data-xh-part="legend-item" value="0"></span>
        <span data-xh-part="legend-item" value="1"></span>
        <span data-xh-part="legend-item" value="2"></span>
        <span data-xh-part="legend-item" value="3"></span>
        <span data-xh-part="legend-item" value="4"></span>
        <span data-xh-part="legend-label" value="high">多</span>
      </div>
    </div>
  </xh-heatmap>
  <p id="heatmap-press-output" aria-live="polite" style="margin: 0">点一格查看明细</p>
</div>

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

  // 载荷与详情同源：行、列、原始值与档位都在里面，不必回头查数据
  const output = document.getElementById("heatmap-press-output");
  heatmap.addEventListener("cell-press", (event) => {
    const { row, column, count } = event.detail;
    output.textContent = \`\${row} \${column}：\${count} 单\`;
  });
<\/script>
`;export{a as default};
