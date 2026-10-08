var e=`<!-- 连续色阶 | 着色按数值的确切比例，不按档位取整：挤在同一档里的几格也分得出高低 -->
<!-- 档位照常算：读屏与打印仍按档报，只有颜色走连续比例 -->
<xh-heatmap id="heatmap-continuous" variant="matrix" continuous>
  <div data-xh-part="root" style="--xh-heatmap-column-w: 36px; --xh-heatmap-row-h: 28px">
    <div data-xh-part="grid">
      <div data-xh-part="row">
        <span data-xh-part="row-label"></span>
        <span data-xh-part="column-label" value="00">00</span>
        <span data-xh-part="column-label" value="04">04</span>
        <span data-xh-part="column-label" value="08">08</span>
        <span data-xh-part="column-label" value="12">12</span>
        <span data-xh-part="column-label" value="16">16</span>
        <span data-xh-part="column-label" value="20">20</span>
      </div>
      <div data-xh-part="row" value="华北">
        <span data-xh-part="row-label" value="华北">华北</span>
        <div data-xh-part="cell" value="00"></div>
        <div data-xh-part="cell" value="04"></div>
        <div data-xh-part="cell" value="08"></div>
        <div data-xh-part="cell" value="12"></div>
        <div data-xh-part="cell" value="16"></div>
        <div data-xh-part="cell" value="20"></div>
      </div>
      <div data-xh-part="row" value="华东">
        <span data-xh-part="row-label" value="华东">华东</span>
        <div data-xh-part="cell" value="00"></div>
        <div data-xh-part="cell" value="04"></div>
        <div data-xh-part="cell" value="08"></div>
        <div data-xh-part="cell" value="12"></div>
        <div data-xh-part="cell" value="16"></div>
        <div data-xh-part="cell" value="20"></div>
      </div>
      <div data-xh-part="row" value="华南">
        <span data-xh-part="row-label" value="华南">华南</span>
        <div data-xh-part="cell" value="00"></div>
        <div data-xh-part="cell" value="04"></div>
        <div data-xh-part="cell" value="08"></div>
        <div data-xh-part="cell" value="12"></div>
        <div data-xh-part="cell" value="16"></div>
        <div data-xh-part="cell" value="20"></div>
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
  // 各机房逐时段的 CPU 利用率（%）：午间几格落在同一档，分档画出来一样深
  const heatmap = document.getElementById("heatmap-continuous");
  heatmap.rows = ["华北", "华东", "华南"];
  heatmap.columns = ["00", "04", "08", "12", "16", "20"];
  heatmap.value = [
    { row: "华北", column: "00", value: 31 },
    { row: "华北", column: "04", value: 28 },
    { row: "华北", column: "08", value: 57 },
    { row: "华北", column: "12", value: 74 },
    { row: "华北", column: "16", value: 69 },
    { row: "华北", column: "20", value: 48 },
    { row: "华东", column: "00", value: 35 },
    { row: "华东", column: "04", value: 30 },
    { row: "华东", column: "08", value: 62 },
    { row: "华东", column: "12", value: 81 },
    { row: "华东", column: "16", value: 77 },
    { row: "华东", column: "20", value: 55 },
    { row: "华南", column: "00", value: 29 },
    { row: "华南", column: "04", value: 26 },
    { row: "华南", column: "08", value: 54 },
    { row: "华南", column: "12", value: 70 },
    { row: "华南", column: "16", value: 72 },
    { row: "华南", column: "20", value: 51 },
  ];
<\/script>
`;export{e as default};