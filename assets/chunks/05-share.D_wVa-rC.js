const a=`<!-- 百分比堆叠面积 | stackOffset: 'expand' 把每个键归一到 100%，看的是构成随时间的变化而不是总量 -->
<div style="width: 100%">
  <xh-cartesian-chart id="cartesian-chart-share">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">访问来源构成</figcaption>
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
  const chart = document.getElementById("cartesian-chart-share");
  chart.data = [
    { month: "1月", search: 420, direct: 260, social: 110, ads: 90 },
    { month: "2月", search: 400, direct: 270, social: 140, ads: 100 },
    { month: "3月", search: 390, direct: 250, social: 180, ads: 120 },
    { month: "4月", search: 370, direct: 260, social: 220, ads: 130 },
    { month: "5月", search: 350, direct: 250, social: 260, ads: 150 },
    { month: "6月", search: 330, direct: 240, social: 300, ads: 160 },
  ];
  // 折线写 area 即铺面积，同一个 stack 名即堆叠；数值轴随之换成百分比
  const share = { area: true, stack: "source", stackOffset: "expand" };
  chart.series = [
    { mark: "line", x: "month", y: "search", name: "搜索", ...share },
    { mark: "line", x: "month", y: "direct", name: "直接访问", ...share },
    { mark: "line", x: "month", y: "social", name: "社交", ...share },
    { mark: "line", x: "month", y: "ads", name: "广告", ...share },
  ];
<\/script>
`;export{a as default};
