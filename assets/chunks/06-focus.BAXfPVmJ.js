const a=`<!-- 焦点明细 | 焦点落到某一天时报出日期与计数，键盘用户与鼠标用户看到同一份明细 -->
<div style="display: grid; gap: 12px">
  <!-- 每格自己就念得出日期与计数；这里再把它显示出来，眼睛也看得见 -->
  <xh-heatmap id="heatmap-focus" start-date="2024-01-01" end-date="2024-01-28">
    <div data-xh-part="root">
      <div data-xh-part="row">
        <span data-xh-part="week-day-label"></span>
        <span data-xh-part="month-label" value="2024-01">1月</span>
      </div>
      <div data-xh-part="grid">
        <div data-xh-part="row" value="0">
          <span data-xh-part="week-day-label" value="0">一</span>
          <div data-xh-part="cell" value="2024-01-01"></div>
          <div data-xh-part="cell" value="2024-01-08"></div>
          <div data-xh-part="cell" value="2024-01-15"></div>
          <div data-xh-part="cell" value="2024-01-22"></div>
        </div>
        <div data-xh-part="row" value="1">
          <span data-xh-part="week-day-label" value="1">二</span>
          <div data-xh-part="cell" value="2024-01-02"></div>
          <div data-xh-part="cell" value="2024-01-09"></div>
          <div data-xh-part="cell" value="2024-01-16"></div>
          <div data-xh-part="cell" value="2024-01-23"></div>
        </div>
        <div data-xh-part="row" value="2">
          <span data-xh-part="week-day-label" value="2">三</span>
          <div data-xh-part="cell" value="2024-01-03"></div>
          <div data-xh-part="cell" value="2024-01-10"></div>
          <div data-xh-part="cell" value="2024-01-17"></div>
          <div data-xh-part="cell" value="2024-01-24"></div>
        </div>
        <div data-xh-part="row" value="3">
          <span data-xh-part="week-day-label" value="3">四</span>
          <div data-xh-part="cell" value="2024-01-04"></div>
          <div data-xh-part="cell" value="2024-01-11"></div>
          <div data-xh-part="cell" value="2024-01-18"></div>
          <div data-xh-part="cell" value="2024-01-25"></div>
        </div>
        <div data-xh-part="row" value="4">
          <span data-xh-part="week-day-label" value="4">五</span>
          <div data-xh-part="cell" value="2024-01-05"></div>
          <div data-xh-part="cell" value="2024-01-12"></div>
          <div data-xh-part="cell" value="2024-01-19"></div>
          <div data-xh-part="cell" value="2024-01-26"></div>
        </div>
        <div data-xh-part="row" value="5">
          <span data-xh-part="week-day-label" value="5">六</span>
          <div data-xh-part="cell" value="2024-01-06"></div>
          <div data-xh-part="cell" value="2024-01-13"></div>
          <div data-xh-part="cell" value="2024-01-20"></div>
          <div data-xh-part="cell" value="2024-01-27"></div>
        </div>
        <div data-xh-part="row" value="6">
          <span data-xh-part="week-day-label" value="6">日</span>
          <div data-xh-part="cell" value="2024-01-07"></div>
          <div data-xh-part="cell" value="2024-01-14"></div>
          <div data-xh-part="cell" value="2024-01-21"></div>
          <div data-xh-part="cell" value="2024-01-28"></div>
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
  <span id="heatmap-focus-readout">（把焦点移到某一格）</span>
</div>

<script type="module">
  // 数据是数组，只走 property；明细经 cell-focus 事件回来
  const host = document.getElementById("heatmap-focus");
  const readout = document.getElementById("heatmap-focus-readout");
  host.value = [
    { date: "2024-01-02", count: 1 },
    { date: "2024-01-04", count: 3 },
    { date: "2024-01-08", count: 6 },
    { date: "2024-01-11", count: 2 },
    { date: "2024-01-15", count: 9 },
    { date: "2024-01-17", count: 4 },
    { date: "2024-01-22", count: 12 },
    { date: "2024-01-25", count: 7 },
    { date: "2024-01-27", count: 2 },
  ];
  host.addEventListener("cell-focus", (event) => {
    const { date, count, level } = event.detail;
    readout.textContent = \`\${date}：\${count} 次（第 \${level} 档）\`;
  });
<\/script>
`;export{a as default};
