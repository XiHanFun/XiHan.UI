var e=`<!-- 只画轮廓 | area 关掉淡洗，只留轮廓线与顶点：实体多、面积叠在一起互相遮挡时更容易分辨 -->
<div style="width: 100%">
  <xh-radar-chart id="radar-chart-outline" name-field="model" area="false">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">三款手机的评测得分</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-radar-chart>
</div>

<script type="module">
  const chart = document.getElementById("radar-chart-outline");
  const phones = [
    { model: "旗舰机", camera: 92, battery: 70, screen: 88, performance: 95, price: 45 },
    { model: "中端机", camera: 74, battery: 86, screen: 72, performance: 70, price: 82 },
    { model: "入门机", camera: 55, battery: 90, screen: 60, performance: 52, price: 95 },
  ];
  const indicators = [
    { key: "camera", label: "影像" },
    { key: "battery", label: "续航" },
    { key: "screen", label: "屏幕" },
    { key: "performance", label: "性能" },
    { key: "price", label: "性价比" },
  ];
  chart.data = phones;
  chart.indicators = indicators;
<\/script>
`;export{e as default};