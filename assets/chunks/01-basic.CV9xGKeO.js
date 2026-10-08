var e=`<!-- 基础用法 | 一组数画成一条折线，末点标出现在的位置；可及名写在 aria-label 上，摘要由组件生成 -->
<!-- 元素只认作者写的空 <svg>：摘要与图形由它按数据生成进去 -->
<xh-sparkline id="sparkline-basic">
  <svg data-xh-part="root" aria-label="近 12 周访问量"></svg>
</xh-sparkline>

<script type="module">
  // 近 12 周的访问量：迷你图只看形状，不读具体的值
  // 数据是数组，只走 property
  document.getElementById("sparkline-basic").data = [320, 356, 341, 398, 420, 388, 452, 470, 431, 498, 520, 548];
<\/script>
`;export{e as default};