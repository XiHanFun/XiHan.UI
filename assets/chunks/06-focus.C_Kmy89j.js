var e=`<!-- 焦点明细 | 悬停或焦点落到某一天时报告日期与计数，键盘用户与鼠标用户看到同一份明细 -->
<!-- 每格自己就念得出日期与计数；这里再把它显示出来，眼睛也看得见 -->
<xh-heatmap id="heatmap-focus" start-date="2024-01-01" end-date="2024-01-28">
  <div data-xh-part="root"></div>
</xh-heatmap>
<span id="heatmap-focus-readout" data-demo-output>（把焦点移到某一格）</span>

<script type="module">
  // 数据是数组，只走 property；明细经 datum-active 事件回来，收起时 detail 为 null
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
  host.addEventListener("datum-active", (event) => {
    if (!event.detail) return;
    const { date, formatted, level } = event.detail;
    readout.textContent = \`\${date}：\${formatted.value} 次（第 \${level} 档）\`;
  });
<\/script>
`;export{e as default};