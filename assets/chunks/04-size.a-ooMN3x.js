var e=`<!-- 尺寸 | size 改变格子边长与行首星期名的留白，一屏能放下的周数随之变化 -->
<!-- 只写 root，一整年的结构由元素生成。宿主自己就是 grid 项，min-width: 0 写在它身上，放不下的那一档才在栏内横着滚 -->
<div style="display: grid; gap: 16px">
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31" size="sm" style="min-width: 0">
    <div data-xh-part="root"></div>
  </xh-heatmap>
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31" size="lg" style="min-width: 0">
    <div data-xh-part="root"></div>
  </xh-heatmap>
</div>

<script type="module">
  const DAY_MS = 86400000;

  // 与基础用法同一份年度数据：只换尺寸档，看同一年占多宽。
  // sm 档格子最小，同样一整年 53 列只要 660px，md 档要 774px，lg 档要 880px
  function buildYear(year) {
    const days = [];
    let index = 0;
    for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
      const at = new Date(time);
      const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
      const month = at.getUTCMonth();
      const peak = month === 2 || month === 9 ? 16 : month === 7 ? 3 : 8;
      const weekend = at.getUTCDay() === 0 || at.getUTCDay() === 6;
      const ceiling = weekend ? peak / 2 : peak;
      days.push({
        date: at.toISOString().slice(0, 10),
        count: noise < 0.16 ? 0 : Math.round(noise * ceiling),
      });
    }
    return days;
  }

  const activity = buildYear(2024);
  // 数据是数组，只走 property：HTML 属性装不下它
  for (const heatmap of document.querySelectorAll("xh-heatmap[size]")) heatmap.value = activity;
<\/script>
`;export{e as default};