var e=`<!-- 条形 | shape="bar" 画成等高的条形：阶段之间要仔细比较宽度时比梯形的斜边好对齐 -->
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-bar" name-field="stage" value-field="users" shape="bar">
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
  const chart = document.getElementById("funnel-chart-bar");
  const steps = [
    { stage: "浏览商品", users: 12800 },
    { stage: "加入购物车", users: 5200 },
    { stage: "提交订单", users: 2300 },
    { stage: "完成支付", users: 1850 },
    { stage: "再次购买", users: 620 },
  ];
  chart.data = steps;
<\/script>
`;export{e as default};