var e=`<!-- 基础用法 | 缺省画成矩形树图：面积与数值成正比，第一层分支各取一个颜色；点一个部门下钻，路径回到上层 -->
<div style="width: 100%">
  <xh-hierarchy-chart id="hierarchy-chart-basic">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">全年预算（万元）</figcaption>
      <nav data-xh-part="path"></nav>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-hierarchy-chart>
</div>

<script type="module">
  const chart = document.getElementById("hierarchy-chart-basic");
  // 嵌套的树：子节点在 children 里，只有叶子写值，上层的值是子孙之和
  const budget = {
    name: "全年预算",
    children: [
      { name: "研发", children: [
        { name: "平台", value: 420 },
        { name: "移动端", value: 260 },
        { name: "数据", value: 180 },
        { name: "测试", value: 90 },
      ] },
      { name: "市场", children: [
        { name: "品牌", value: 210 },
        { name: "渠道", value: 160 },
        { name: "活动", value: 120 },
      ] },
      { name: "销售", children: [
        { name: "华东", value: 240 },
        { name: "华南", value: 180 },
        { name: "华北", value: 150 },
        { name: "西部", value: 60 },
      ] },
      { name: "运营", children: [
        { name: "客服", value: 110 },
        { name: "内容", value: 80 },
      ] },
      { name: "行政", children: [
        { name: "办公", value: 70 },
        { name: "人事", value: 50 },
      ] },
    ],
  };
  chart.data = budget;
<\/script>
`;export{e as default};