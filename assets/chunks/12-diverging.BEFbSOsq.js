const a=`<!-- 发散色阶 | 数据里有负数时以 0 为中点分两侧着色：相关系数矩阵，负相关与正相关各走一种颜色 -->
<!-- 对照条两侧各一排：polarity 标明在中点哪一侧，次序与 legendItems 一致；两端文字是两侧最远的数，与 legendText 一致 -->
<xh-heatmap id="heatmap-diverging" variant="matrix">
  <div data-xh-part="root" style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px">
    <div data-xh-part="grid">
      <div data-xh-part="row">
        <span data-xh-part="row-label"></span>
        <span data-xh-part="column-label" value="时长">时长</span>
        <span data-xh-part="column-label" value="页数">页数</span>
        <span data-xh-part="column-label" value="跳出">跳出</span>
        <span data-xh-part="column-label" value="转化">转化</span>
      </div>
      <div data-xh-part="row" value="时长">
        <span data-xh-part="row-label" value="时长">时长</span>
        <div data-xh-part="cell" value="时长"></div>
        <div data-xh-part="cell" value="页数"></div>
        <div data-xh-part="cell" value="跳出"></div>
        <div data-xh-part="cell" value="转化"></div>
      </div>
      <div data-xh-part="row" value="页数">
        <span data-xh-part="row-label" value="页数">页数</span>
        <div data-xh-part="cell" value="时长"></div>
        <div data-xh-part="cell" value="页数"></div>
        <div data-xh-part="cell" value="跳出"></div>
        <div data-xh-part="cell" value="转化"></div>
      </div>
      <div data-xh-part="row" value="跳出">
        <span data-xh-part="row-label" value="跳出">跳出</span>
        <div data-xh-part="cell" value="时长"></div>
        <div data-xh-part="cell" value="页数"></div>
        <div data-xh-part="cell" value="跳出"></div>
        <div data-xh-part="cell" value="转化"></div>
      </div>
      <div data-xh-part="row" value="转化">
        <span data-xh-part="row-label" value="转化">转化</span>
        <div data-xh-part="cell" value="时长"></div>
        <div data-xh-part="cell" value="页数"></div>
        <div data-xh-part="cell" value="跳出"></div>
        <div data-xh-part="cell" value="转化"></div>
      </div>
    </div>
    <div data-xh-part="legend">
      <span data-xh-part="legend-label" value="low">-1</span>
      <span data-xh-part="legend-item" value="4" polarity="negative"></span>
      <span data-xh-part="legend-item" value="3" polarity="negative"></span>
      <span data-xh-part="legend-item" value="2" polarity="negative"></span>
      <span data-xh-part="legend-item" value="1" polarity="negative"></span>
      <span data-xh-part="legend-item" value="0"></span>
      <span data-xh-part="legend-item" value="1" polarity="positive"></span>
      <span data-xh-part="legend-item" value="2" polarity="positive"></span>
      <span data-xh-part="legend-item" value="3" polarity="positive"></span>
      <span data-xh-part="legend-item" value="4" polarity="positive"></span>
      <span data-xh-part="legend-label" value="high">1</span>
    </div>
  </div>
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
`;export{a as default};
