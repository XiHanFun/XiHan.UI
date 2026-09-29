const e=`<!-- 极值 | markers="extremes" 在末点之外再标出最高与最低点；markers="none" 一个点都不标 -->
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: var(--xh-space-6)">
  <xh-sparkline data-demo="sparkline-markers" markers="extremes">
    <svg data-xh-part="root" aria-label="今日在线人数，标出最高与最低"></svg>
  </xh-sparkline>
  <xh-sparkline data-demo="sparkline-markers" markers="none">
    <svg data-xh-part="root" aria-label="今日在线人数"></svg>
  </xh-sparkline>
</div>

<script type="module">
  // 一天里每两小时的在线人数
  for (const el of document.querySelectorAll("[data-demo='sparkline-markers']"))
    el.data = [820, 640, 410, 380, 560, 1240, 1580, 1320, 1460, 1710, 1390, 980];
<\/script>
`;export{e as default};
