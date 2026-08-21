const e=`<!-- 基础用法 | 一整年铺成周列 × 星期行的方格阵，颜色深浅表示当天数值落在第几档 -->
<div id="heatmap-basic-mount"></div>

<!-- 元素不生成结构：外壳只写 root，一整年的月份行、七行星期与图例由脚本照 grid 铺 -->
<template id="heatmap-basic-template">
  <xh-heatmap start-date="2024-01-01" end-date="2024-12-31">
    <div data-xh-part="root"></div>
  </xh-heatmap>
</template>

<script type="module">
  const DAY_MS = 86400000;

  // 一整年的提交量：工作日多、周末少，三月与十月各有一波冲刺，八月是长假的空档。
  // 数值由天序号哈希出来，同一年恒出同一份数据，示例每次打开都长一样
  function buildYear(year) {
    const days = [];
    let index = 0;
    for (let time = Date.UTC(year, 0, 1); time <= Date.UTC(year, 11, 31); time += DAY_MS) {
      const at = new Date(time);
      const noise = ((Math.imul(++index, 2654435761) >>> 8) % 1000) / 1000;
      const month = at.getUTCMonth();
      // 冲刺月的量翻倍，八月压到最低；周末一律减半
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

  const fragment = document
    .getElementById("heatmap-basic-template")
    .content.cloneNode(true);
  const heatmap = fragment.querySelector("xh-heatmap");
  const root = fragment.querySelector('[data-xh-part="root"]');

  // 元素一连上就能读 grid，接线排在这之后，铺出来的格子赶得上
  document.getElementById("heatmap-basic-mount").append(fragment);
  // 数据是数组，只走 property：HTML 属性装不下它
  heatmap.value = buildYear(2024);

  // 只读的 grid 一次取出来用：每读一次都重算一遍整张网格
  const grid = heatmap.grid;

  // 月份行排在网格之外，行首那个占位与下面各行的星期名同宽，月份才对得上列
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

  root.append(monthRow, gridEl, legend);
<\/script>
`;export{e as default};
