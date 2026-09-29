const n=`<!-- 盈亏 | variant="win-loss" 只看正负：正值在中线之上、负值在中线之下，柱等高，0 不画 -->
<xh-sparkline id="sparkline-win-loss" variant="win-loss">
  <svg data-xh-part="root" aria-label="近 16 个交易日盈亏"></svg>
</xh-sparkline>

<script type="module">
  // 近 16 个交易日的盈亏（元）：只关心赚还是亏、连续几天
  document.getElementById("sparkline-win-loss").data = [120, -40, 85, 60, -15, -80, 0, 45, 30, 90, -25, 70, 55, -60, 20, 110];
<\/script>
`;export{n as default};
