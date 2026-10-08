var e=`<!-- 金字塔 | direction="up" 画成金字塔：第一阶段在最下面，往上逐级收窄；层级之间是包含关系，不写转化率 -->
<div style="width: 100%">
  <xh-funnel-chart id="funnel-chart-pyramid" name-field="stage" value-field="users" direction="up" conversion="none">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">会员等级分布</figcaption>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-funnel-chart>
</div>

<script type="module">
  const chart = document.getElementById("funnel-chart-pyramid");
  const steps = [
    { stage: "普通会员", users: 48000 },
    { stage: "银卡", users: 12500 },
    { stage: "金卡", users: 3100 },
    { stage: "钻石", users: 420 },
  ];
  chart.data = steps;
<\/script>
`;export{e as default};