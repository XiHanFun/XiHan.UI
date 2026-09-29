const t=`<!-- 相对第一阶段 | conversion="first" 让每个阶段写相对第一阶段的转化率：读者关心从头到尾留下多少 -->
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-first" name-field="stage" value-field="users" conversion="first">
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
  const chart = document.getElementById("funnel-chart-first");
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
