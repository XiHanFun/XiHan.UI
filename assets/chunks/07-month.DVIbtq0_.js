var e=`<!-- 月历形态 | 按自然月分块，每块是一张真实月历，1 号落在它实际的星期几上 -->
<!-- 连续周列看不出月界，按自然月分块才比得了逐月的分布 -->
<xh-heatmap id="heatmap-month" variant="month" start-date="2024-01-15" end-date="2024-02-11">
  <div data-xh-part="root"></div>
</xh-heatmap>

<script type="module">
  // 数据是数组，只走 property：HTML 属性装不下它
  document.getElementById("heatmap-month").value = [
    { date: "2024-01-16", count: 1 },
    { date: "2024-01-18", count: 3 },
    { date: "2024-01-22", count: 6 },
    { date: "2024-01-25", count: 2 },
    { date: "2024-01-29", count: 9 },
    { date: "2024-01-31", count: 4 },
    { date: "2024-02-05", count: 12 },
    { date: "2024-02-08", count: 7 },
    { date: "2024-02-10", count: 2 },
  ];
<\/script>
`;export{e as default};