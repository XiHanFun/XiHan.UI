var e=`<!-- 形态 | variant 切换同一组数的画法：line 折线、area 折线下铺一层淡洗、bar 柱 -->
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-6)">
  <xh-sparkline data-demo="sparkline-variant" variant="line">
    <svg data-xh-part="root" aria-label="近 8 天订单数（line）"></svg>
  </xh-sparkline>
  <xh-sparkline data-demo="sparkline-variant" variant="area">
    <svg data-xh-part="root" aria-label="近 8 天订单数（area）"></svg>
  </xh-sparkline>
  <xh-sparkline data-demo="sparkline-variant" variant="bar">
    <svg data-xh-part="root" aria-label="近 8 天订单数（bar）"></svg>
  </xh-sparkline>
</div>

<script type="module">
  for (const el of document.querySelectorAll("[data-demo='sparkline-variant']"))
    el.data = [18, 24, 21, 30, 27, 35, 32, 41];
<\/script>
`;export{e as default};