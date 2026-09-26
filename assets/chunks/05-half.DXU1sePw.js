const t=`<!-- 半环 | sweep="half" 自 9 点扫到 3 点，高度只要一半，适合放在指标卡上方 -->
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-half" name-field="item" value-field="amount" sweep="half" sort="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">预算执行</figcaption>
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
  // 半环的圆心在弦上，合计整块放在弦的上方、内圈里
  // 数据是数组，只走 property
  document.getElementById("pie-chart-half").data = [
    { item: "已支出", amount: 62 },
    { item: "已冻结", amount: 18 },
    { item: "可用", amount: 20 },
  ];
<\/script>
`;export{t as default};
