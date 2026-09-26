const t=`<!-- 玫瑰图 | rose 让角度均分、半径按数值：面积与数值成正比，适合各项差距悬殊时拉开层次 -->
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-rose" name-field="quarter" value-field="users" rose sort="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各季度新增用户（千人）</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  // 季度有自然次序，sort="none" 按数据次序排，不按大小
  // 数据是数组，只走 property
  document.getElementById("pie-chart-rose").data = [
    { quarter: "一季度", users: 120 },
    { quarter: "二季度", users: 210 },
    { quarter: "三季度", users: 340 },
    { quarter: "四季度", users: 460 },
  ];
<\/script>
`;export{t as default};
