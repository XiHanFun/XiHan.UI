const n=`<!-- 摘要文案 | 读屏念出的描述由 translations.summary 按摘要模型写成，数值按 locale 与 format 格式化 -->
<xh-sparkline id="sparkline-summary" locale="zh-CN">
  <svg data-xh-part="root" aria-label="近 6 个月账户余额"></svg>
</xh-sparkline>

<script type="module">
  const sparkline = document.getElementById("sparkline-summary");
  sparkline.data = [12800, 13400, 12950, 14100, 13820, 15260];
  sparkline.format = { style: "currency", currency: "CNY", precision: { type: "fixed", digits: 0 } };
  // 模型里的数值已按 locale 与 format 写好，模板只管措辞
  sparkline.translations = {
    summary: (m) => {
      if (m.count === 0)
        return "没有数据。";
      const trend = m.direction === "up" ? \`上升 \${m.change}\` : m.direction === "down" ? \`下降 \${m.change}\` : "持平";
      return \`\${m.count} 个月，最低 \${m.min}，最高 \${m.max}；最新 \${m.last}，较首月\${trend}。\`;
    },
  };
<\/script>
`;export{n as default};
