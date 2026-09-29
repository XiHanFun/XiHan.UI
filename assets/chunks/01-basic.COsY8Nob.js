const t=`<!-- 基础用法 | 一行数据一个阶段、按先后排好：宽度与数值成正比，相邻阶段之间写出相对上一阶段的转化率 -->
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-basic" name-field="stage" value-field="users">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">本月购买流程</figcaption>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-funnel-chart>
</div>

<script type="module">
  const chart = document.getElementById("funnel-chart-basic");
  // 每行一个阶段，次序就是流程的先后
  const steps = [
    { stage: "浏览商品", users: 12800 },
    { stage: "加入购物车", users: 5200 },
    { stage: "提交订单", users: 2300 },
    { stage: "完成支付", users: 1850 },
    { stage: "再次购买", users: 620 },
  ];
  chart.data = steps;
<\/script>
`;export{t as default};
