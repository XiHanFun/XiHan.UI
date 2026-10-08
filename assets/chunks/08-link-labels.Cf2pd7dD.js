var e=`<!-- 连线上的字 | 连线的 label 写在连线中点，描一圈底色压在线上也读得清；和名字压住时不写，数据表里多一列照样读得到 -->
<div style="width: 100%">
  <xh-graph-chart id="graph-chart-link-labels">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">一家人和他们的朋友</figcaption>
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
  const chart = document.getElementById("graph-chart-link-labels");
  const people = [
    { id: "li", name: "李明" },
    { id: "wang", name: "王芳" },
    { id: "yu", name: "李小雨" },
    { id: "chen", name: "陈刚" },
    { id: "zhou", name: "周婷" },
  ];
  // 关系名短时才写在线上，长句放进提示框或旁边的表
  const relations = [
    { source: "li", target: "wang", label: "夫妻" },
    { source: "li", target: "yu", label: "父女" },
    { source: "wang", target: "yu", label: "母女" },
    { source: "li", target: "chen", label: "同事" },
    { source: "wang", target: "zhou", label: "同学" },
  ];
  chart.nodes = people;
  chart.links = relations;
<\/script>
`;export{e as default};