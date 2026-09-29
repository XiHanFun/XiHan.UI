const e=`<!-- 标签内容 | labelContent 决定标签写什么：取 name-value 等内建写法，或给函数自己拼；返回空串的扇区不写标签 -->
<div style="width: 100%">
  <xh-pie-chart id="pie-chart-label-content" name-field="category" value-field="revenue">
    <figure data-xh-part="root">
      <figcaption data-xh-part="caption">各品类营收</figcaption>
      <div data-xh-part="legend"></div>
      <div data-xh-part="viewport">
        <svg data-xh-part="plot"></svg>
        <div data-xh-part="center"></div>
        <div data-xh-part="empty"></div>
      </div>
      <div data-xh-part="tooltip"></div>
    </figure>
  </xh-pie-chart>
</div>

<script type="module">
  const chart = document.getElementById("pie-chart-label-content");
  chart.data = [
    { category: "服饰", revenue: 386 },
    { category: "数码", revenue: 274 },
    { category: "家居", revenue: 158 },
    { category: "美妆", revenue: 96 },
    { category: "图书", revenue: 42 },
  ];
  // 写金额与占比两样；不到 5% 的扇区交给图例与提示框。函数只走 property，内建写法另有 label-content 属性
  chart.labelContent = slice => (slice.share < 0.05 ? "" : \`\${slice.name} \${slice.formatted.value} 万（\${slice.formatted.share}）\`);
<\/script>
`;export{e as default};
