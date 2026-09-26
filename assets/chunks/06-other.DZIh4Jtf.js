const r=`<!-- 「其他」合并 | 扇区多于 maxSlices 时最小的几块并成「其他」，排在最后、取中性色，提示框里列出被合并的各项 -->
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-other" name-field="province" value-field="orders" max-slices="5">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各省订单占比</figcaption>
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
  // maxSlices 含「其他」那一块：这里保留 4 个省份加「其他」
  // 数据是数组，只走 property
  document.getElementById("pie-chart-other").data = [
    { province: "广东", orders: 3200 },
    { province: "浙江", orders: 2400 },
    { province: "江苏", orders: 2100 },
    { province: "山东", orders: 1300 },
    { province: "四川", orders: 800 },
    { province: "湖北", orders: 600 },
    { province: "福建", orders: 500 },
    { province: "河南", orders: 400 },
  ];
<\/script>
`;export{r as default};
