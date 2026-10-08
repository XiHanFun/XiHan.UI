var e=`<!-- 树 | layout="tree" 从没有入边的节点组树，根在最左、自左而右；数据不是树时报错 -->
<div style="width: 100%">
  <xh-graph-chart id="graph-chart-tree" layout="tree">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">组织架构</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-graph-chart>
</div>

<script type="module">
  const chart = document.getElementById("graph-chart-tree");
  // 节点：一人一个
  const people = [
    { id: "ceo", name: "总经理" },
    { id: "cto", name: "技术" },
    { id: "cfo", name: "财务" },
    { id: "coo", name: "运营" },
    { id: "fe", name: "前端" },
    { id: "be", name: "后端" },
    { id: "qa", name: "测试" },
    { id: "acc", name: "会计" },
    { id: "tax", name: "税务" },
    { id: "mkt", name: "市场" },
    { id: "sales", name: "销售" },
    { id: "support", name: "客服" },
  ];
  // 连线从上级指向下级
  const reports = [
    { source: "ceo", target: "cto" },
    { source: "ceo", target: "cfo" },
    { source: "ceo", target: "coo" },
    { source: "cto", target: "fe" },
    { source: "cto", target: "be" },
    { source: "cto", target: "qa" },
    { source: "cfo", target: "acc" },
    { source: "cfo", target: "tax" },
    { source: "coo", target: "mkt" },
    { source: "coo", target: "sales" },
    { source: "coo", target: "support" },
  ];
  chart.nodes = people;
  chart.links = reports;
<\/script>
`;export{e as default};