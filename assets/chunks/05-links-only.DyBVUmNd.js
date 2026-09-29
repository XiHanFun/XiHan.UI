const t=`<!-- 只写流带 | 不写 nodes 时节点按流带里出现的先后推断，名字就是身份，全部用同一个颜色 -->
<div style="width: 100%">
  <xh-sankey-chart id="sankey-chart-links-only">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">年度能源流向（万吨标准煤）</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-sankey-chart>
</div>

<script type="module">
  const chart = document.getElementById("sankey-chart-links-only");
  // 节点从流带推断：源与目标写名字即可
  const links = [
    { source: "煤炭", target: "发电", value: 420 },
    { source: "天然气", target: "发电", value: 160 },
    { source: "天然气", target: "供热", value: 90 },
    { source: "水电", target: "发电", value: 130 },
    { source: "发电", target: "工业", value: 340 },
    { source: "发电", target: "居民", value: 210 },
    { source: "发电", target: "损耗", value: 160 },
    { source: "供热", target: "居民", value: 70 },
    { source: "供热", target: "损耗", value: 20 },
  ];
  chart.links = links;
<\/script>
`;export{t as default};
