const n=`<!-- 随文 | 缺省高度是所在行的一行字高、宽 6rem，放进正文或更小的说明文字里都不撑高这一行 -->
<div style="display: grid; gap: var(--xh-space-3)">
  <div>
    本周注册
    <xh-sparkline data-demo="sparkline-inline">
      <svg data-xh-part="root" aria-label="本周每日注册数"></svg>
    </xh-sparkline>
    共 362 人，较上周多 18%。
  </div>
  <div style="color: var(--xh-fg-muted); font-size: var(--xh-text-caption-size)">
    数据截至今日 18:00
    <xh-sparkline data-demo="sparkline-inline" markers="none">
      <svg data-xh-part="root" aria-label="本周每日注册数"></svg>
    </xh-sparkline>
  </div>
</div>

<script type="module">
  for (const el of document.querySelectorAll("[data-demo='sparkline-inline']"))
    el.data = [42, 38, 51, 47, 60, 58, 66];
<\/script>
`;export{n as default};
