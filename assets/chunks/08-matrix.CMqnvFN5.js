const a=`<!-- 矩阵形态 | 行列都由作者给，数据按行列定位而不按日期：星期 × 时段的活跃度 -->
<!-- 行名与列名都是真表头，读屏报某一格时会连着念出它属于哪一行哪一列 -->
<xh-heatmap id="heatmap-matrix" variant="matrix">
  <div data-xh-part="root" style="--xh-heatmap-column-w: 44px; --xh-heatmap-row-h: 28px">
    <div data-xh-part="grid">
      <div data-xh-part="row">
        <span data-xh-part="row-label"></span>
        <span data-xh-part="column-label" value="09:00">09:00</span>
        <span data-xh-part="column-label" value="12:00">12:00</span>
        <span data-xh-part="column-label" value="15:00">15:00</span>
        <span data-xh-part="column-label" value="18:00">18:00</span>
        <span data-xh-part="column-label" value="21:00">21:00</span>
      </div>
      <div data-xh-part="row" value="周一">
        <span data-xh-part="row-label" value="周一">周一</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
      <div data-xh-part="row" value="周二">
        <span data-xh-part="row-label" value="周二">周二</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
      <div data-xh-part="row" value="周三">
        <span data-xh-part="row-label" value="周三">周三</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
      <div data-xh-part="row" value="周四">
        <span data-xh-part="row-label" value="周四">周四</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
      </div>
      <div data-xh-part="row" value="周五">
        <span data-xh-part="row-label" value="周五">周五</span>
        <div data-xh-part="cell" value="09:00"></div>
        <div data-xh-part="cell" value="12:00"></div>
        <div data-xh-part="cell" value="15:00"></div>
        <div data-xh-part="cell" value="18:00"></div>
        <div data-xh-part="cell" value="21:00"></div>
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

<script type="module">
  // 行、列与数据都是数组，只走 property：HTML 属性装不下它们
  const matrix = document.getElementById("heatmap-matrix");
  matrix.rows = ["周一", "周二", "周三", "周四", "周五"];
  matrix.columns = ["09:00", "12:00", "15:00", "18:00", "21:00"];
  matrix.value = [
    { row: "周一", column: "09:00", value: 12 },
    { row: "周一", column: "12:00", value: 30 },
    { row: "周一", column: "18:00", value: 22 },
    { row: "周二", column: "12:00", value: 26 },
    { row: "周二", column: "21:00", value: 9 },
    { row: "周三", column: "09:00", value: 6 },
    { row: "周三", column: "15:00", value: 18 },
    { row: "周四", column: "12:00", value: 34 },
    { row: "周四", column: "18:00", value: 28 },
    { row: "周五", column: "15:00", value: 14 },
    { row: "周五", column: "18:00", value: 40 },
    { row: "周五", column: "21:00", value: 25 },
  ];
<\/script>
`;export{a as default};
