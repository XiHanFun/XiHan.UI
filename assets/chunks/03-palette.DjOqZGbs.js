const e=`<!-- 色板换色 | palette 直接按颜色点名，六个色板只换色阶满档那一端，分档与空格底都不动 -->
<div id="heatmap-palette-mount" style="display: flex; flex-wrap: wrap; gap: 20px"></div>

<!-- 元素不生成结构：外壳只写 root，月份行、七行星期与图例由脚本照 grid 铺 -->
<template id="heatmap-palette-template">
  <div style="display: grid; gap: 4px">
    <span style="color: var(--xh-fg-subtle); font-size: 12px"></span>
    <!-- 只写 palette：色板管的只有满档实心底那一端，档位怎么分与它无关 -->
    <xh-heatmap start-date="2024-01-01" end-date="2024-01-28">
      <div data-xh-part="root"></div>
    </xh-heatmap>
  </div>
</template>

<script type="module">
  // 同一份数据铺六遍，肉眼比的就只有颜色这一件事
  const activity = [
    { date: "2024-01-02", count: 1 },
    { date: "2024-01-04", count: 3 },
    { date: "2024-01-08", count: 6 },
    { date: "2024-01-11", count: 2 },
    { date: "2024-01-15", count: 9 },
    { date: "2024-01-17", count: 4 },
    { date: "2024-01-22", count: 12 },
    { date: "2024-01-25", count: 7 },
    { date: "2024-01-27", count: 2 },
  ];

  const palettes = ["green", "blue", "orange", "purple", "red", "gray"];

  /** 一个角色节点：身份写在 value 上，元素照它回网格里查数值与档位。 */
  function part(tag, name, value, text) {
    const el = document.createElement(tag);
    el.dataset.xhPart = name;
    if (value !== undefined) el.setAttribute("value", value);
    if (text !== undefined) el.textContent = text;
    return el;
  }

  const mount = document.getElementById("heatmap-palette-mount");
  const template = document.getElementById("heatmap-palette-template");

  for (const palette of palettes) {
    const fragment = template.content.cloneNode(true);
    fragment.querySelector("span").textContent = palette;
    const heatmap = fragment.querySelector("xh-heatmap");
    heatmap.setAttribute("palette", palette);
    const root = fragment.querySelector('[data-xh-part="root"]');

    // 元素一连上就能读 grid，接线排在这之后，铺出来的格子赶得上
    mount.append(fragment);
    // 数据是数组，只走 property：HTML 属性装不下它
    heatmap.value = activity;

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
  }
<\/script>
`;export{e as default};
