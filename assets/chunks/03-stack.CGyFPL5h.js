const a=`<!-- 堆叠柱 | 同一个 stack 名的柱系列首尾相接，柱高是各部分之和，相邻两段之间留一道表面缝 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-stack">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各渠道季度营收（万元）</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-cartesian-chart>
</div>

<script type="module">
  const chart = document.getElementById("cartesian-chart-stack");
  chart.data = [
    { quarter: "一季度", online: 320, store: 210, partner: 90 },
    { quarter: "二季度", online: 380, store: 190, partner: 120 },
    { quarter: "三季度", online: 410, store: 230, partner: 140 },
    { quarter: "四季度", online: 520, store: 260, partner: 180 },
  ];
  // 三个系列写同一个 stack 名即堆叠；图例次序即自下而上的次序
  chart.series = [
    { mark: "bar", x: "quarter", y: "online", name: "线上", stack: "channel" },
    { mark: "bar", x: "quarter", y: "store", name: "门店", stack: "channel" },
    { mark: "bar", x: "quarter", y: "partner", name: "分销", stack: "channel" },
  ];
<\/script>
`;export{a as default};
