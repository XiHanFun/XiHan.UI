const e=`<!-- 悬停详情 | 指针悬停与键盘聚焦走同一条路：详情条跟着那一格走，Escape 收起 -->
<div id="heatmap-detail-mount"></div>

<!-- 详情条要作者自己写进标记；一整年的网格由脚本照 grid 铺 -->
<template id="heatmap-detail-template">
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31">
    <div data-xh-part="root">
      <div data-xh-part="tooltip"></div>
    </div>
  </xh-heatmap>
</template>

<script type="module">
  const DAY_MS = 86400000;

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

  /** 一个角色节点：身份写在 value 上，元素照它回网格里查数值与档位。 */
  function part(tag, name, value, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    if (value !== undefined) el.setAttribute("value", value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // 详情条里那一句
  const readout = (details) =>
    details ? \`\${details.date}：\${details.count} 次（第 \${details.level} 档）\` : "";

  const fragment = document
    .getElementById("heatmap-detail-template")
    .content.cloneNode(true);
  const heatmap = fragment.querySelector("xh-heatmap");
  const root = fragment.querySelector('[data-xh-part="root"]');
  const tip = fragment.querySelector('[data-xh-part="tooltip"]');

  document.getElementById("heatmap-detail-mount").append(fragment);
  // 详情条对读屏是藏起来的，同一句必须同时当每格的可及名字，两处才不会各说各的
  heatmap.translations = { cellLabel: readout };
  // 数据是数组，只走 property：HTML 属性装不下它
  heatmap.value = buildYear(2024);

  const grid = heatmap.grid;

  const monthRow = part("div", "row");
  monthRow.append(part("span", "week-day-label"));
  for (const month of grid.months) {
    monthRow.append(part("span", "month-label", month.value, month.label));
  }

  const gridEl = part("div", "grid");
  for (const row of grid.rows) {
    const line = part("div", "row", row.weekDay);
    line.append(part("span", "week-day-label", row.weekDay, grid.weekDays[row.weekDay].label));
    for (const day of row.cells) {
      line.append(part("div", "cell", day.date));
    }
    gridEl.append(line);
  }

  const legend = part("div", "legend");
  // 两端各一个字：一排色块自己说不出哪头是多，文案跟着 legendText 走
  legend.append(part("span", "legend-label", "low", heatmap.legendText.low));
  for (let level = 0; level < grid.levels; level++) {
    legend.append(part("span", "legend-item", level));
  }
  legend.append(part("span", "legend-label", "high", heatmap.legendText.high));

  // 详情条排在网格与图例之间，与 Vue 侧不写默认插槽时铺出来的次序一致
  root.insertBefore(monthRow, tip);
  root.insertBefore(gridEl, tip);
  root.append(legend);

  // 详情该显示哪一格经 cell-active 事件回来
  heatmap.addEventListener("cell-active", (event) => {
    tip.textContent = readout(event.detail);
  });
<\/script>
`;export{e as default};
