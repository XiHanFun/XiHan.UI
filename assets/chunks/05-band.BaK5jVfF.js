var e=`<!-- 参考带 | band 把正常区间画成一条淡底，一眼看出哪几次越界；纵向范围会扩到把它包进来 -->
<xh-sparkline id="sparkline-band">
  <svg data-xh-part="root" aria-label="近 14 天 P95 延迟，正常区间 120 到 200 毫秒"></svg>
</xh-sparkline>

<script type="module">
  // 近 14 天的接口 P95 延迟（ms），正常区间 120–200；参考带是数组，只走 property
  const sparkline = document.getElementById("sparkline-band");
  sparkline.data = [150, 162, 148, 171, 188, 214, 196, 172, 165, 158, 231, 204, 179, 168];
  sparkline.band = [120, 200];
<\/script>
`;export{e as default};