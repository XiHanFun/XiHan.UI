var e=`<!-- 参考线 | reference 画一条横贯的虚线：写目标值看每天达没达标，写 mean / median 看高于还是低于平常；摘要一并读出它的值 -->
<div style="display: grid; gap: 8px">
  <xh-sparkline id="sparkline-reference-target" reference="180">
    <svg data-xh-part="root" aria-label="近 14 天日销量，目标 180 单"></svg>
  </xh-sparkline>
  <!-- 均值由组件按有值的点算出 -->
  <xh-sparkline id="sparkline-reference-mean" reference="mean" variant="area">
    <svg data-xh-part="root" aria-label="近 14 天日销量与均值"></svg>
  </xh-sparkline>
</div>

<script type="module">
  // 近 14 天的日销量（单），目标每天 180
  const sales = [150, 162, 188, 171, 196, 214, 176, 182, 165, 158, 201, 194, 179, 186];
  document.getElementById("sparkline-reference-target").data = sales;
  document.getElementById("sparkline-reference-mean").data = sales;
<\/script>
`;export{e as default};