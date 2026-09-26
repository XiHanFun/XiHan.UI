const n=`<!-- 基础用法 | 一行数据一个扇区：nameField 取扇区名字段，valueField 取数值字段；缺省画成环形，中心显示合计 -->
<!-- 元素只认作者写的外壳：扇区、标签与图例项由它按数据生成进 plot 与 legend；center 留空时写入合计 -->
<!-- 宿主元素缺省是行内元素，放进 flex / grid 时给它一个宽度，图才铺得开 -->
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-basic" name-field="channel" value-field="visits">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">访问来源</figcaption>
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
  // 缺省按数值从大到小、自 12 点顺时针排列，外侧标签带引导线
  // 数据是数组，只走 property
  document.getElementById("pie-chart-basic").data = [
    { channel: "搜索", visits: 4200 },
    { channel: "直接访问", visits: 2600 },
    { channel: "社交", visits: 1800 },
    { channel: "邮件", visits: 900 },
    { channel: "广告", visits: 500 },
  ];
<\/script>
`;export{n as default};
