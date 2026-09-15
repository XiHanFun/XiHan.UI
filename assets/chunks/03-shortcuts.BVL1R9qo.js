const e=`<!-- 快捷选项 | 常用区间一键写入两端 -->
<div id="date-range-picker-shortcuts-mount"></div>

<template id="date-range-picker-shortcuts-template">
  <xh-date-range-picker locale="zh-CN">
    <div data-xh-part="root" style="--xh-date-range-picker-control-min-w: calc(var(--xh-control-min-w) * 2 + var(--xh-control-h-md) * 2 + var(--xh-space-6))">
      <span data-xh-part="label">统计区间</span>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；里面铺几段由 granularity 推 -->
        <div data-xh-part="segment-group"></div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <!-- 快捷选项条目自报 value，与 presets 数据里的 value 逐字对上 -->
          <div data-xh-part="preset-group"></div>
        </div>
      </div>
    </div>
  </xh-date-range-picker>
</template>

<script type="module">
  const fragment = document.getElementById("date-range-picker-shortcuts-template").content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-range-picker");
  const groups = picker.querySelectorAll('[data-xh-part="segment-group"]');
  const content = picker.querySelector('[data-xh-part="content"]');
  // 日子在自己这儿算好再传：库不在渲染期算「今天」。值用 ISO 8601 的区间写法把两端拼在一起
  const today = new Date();
  const iso = (d) => d.toISOString().slice(0, 10);
  const shift = (days) => new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate() + days));
  const monthStart = (offset) => new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset, 1));
  const monthEnd = (offset) => new Date(Date.UTC(today.getFullYear(), today.getMonth() + offset + 1, 0));
  const presets = [
    { label: "近 7 天", value: \`\${iso(shift(-6))}/\${iso(shift(0))}\` },
    { label: "近 30 天", value: \`\${iso(shift(-29))}/\${iso(shift(0))}\` },
    { label: "本月", value: \`\${iso(monthStart(0))}/\${iso(monthEnd(0))}\` },
    { label: "上月", value: \`\${iso(monthStart(-1))}/\${iso(monthEnd(-1))}\` },
    { label: "今年", value: \`\${today.getFullYear()}-01-01/\${today.getFullYear()}-12-31\` },
  ];
  picker.presets = presets;
  // 条目由作者铺：value 属性对上数据，文字自己写
  const list = picker.querySelector('[data-xh-part="preset-group"]');
  for (const preset of presets) {
    const item = document.createElement("div");
    item.dataset.xhPart = "preset";
    item.setAttribute("value", preset.value);
    item.textContent = preset.label;
    list.append(item);
  }

  function node(tag, part, text) {
    const el = document.createElement(tag);
    if (part) {
      el.dataset.xhPart = part;
    }
    if (text !== undefined) {
      el.textContent = text;
    }
    return el;
  }

  function pageTrigger(part, label) {
    const el = node("button", part);
    el.setAttribute("aria-label", label);
    return el;
  }

  function dayCell(value, text) {
    const cell = node("div", "cell");
    cell.setAttribute("value", value);
    cell.append(node("div", "cell-trigger", text));
    return cell;
  }

  // 一页一张日历：面板号写在标题与网格上，格子跟着所在网格走
  function panelOf(panel, last, weekDays) {
    const calendar = node("div", "calendar");
    const header = node("div", "header");
    // 往前只在最左那张、往后只在最右那张：翻页整窗一起走
    if (panel.index === 0) {
      header.append(pageTrigger("prev-trigger", "上一页"));
    }
    const heading = node("div", "heading", panel.headingLabel);
    heading.setAttribute("index", panel.index);
    header.append(heading);
    if (last) {
      header.append(pageTrigger("next-trigger", "下一页"));
    }

    const grid = node("div", "grid");
    grid.setAttribute("index", panel.index);
    // 日视图铺周行，粗粒度视图把格子直接铺进网格
    if (panel.weeks.length > 0) {
      const head = node("div", "grid-head");
      const headRow = node("div", "week-row");
      for (const day of weekDays) {
        const column = node("span", "week-day", day.label);
        column.setAttribute("value", day.value);
        headRow.append(column);
      }
      head.append(headRow);

      const body = node("div", "grid-body");
      for (const week of panel.weeks) {
        const row = node("div", "week-row");
        for (const day of week) {
          row.append(dayCell(day.start, day.day));
        }
        body.append(row);
      }
      grid.append(head, body);
    } else {
      for (const cell of panel.cells) {
        grid.append(dayCell(cell.start, cell.label));
      }
    }

    calendar.append(header, grid);
    return calendar;
  }

  // 已经画出来的是哪几页
  let painted = "";

  function paintPanels() {
    const panels = picker.panels;
    const signature = panels
      .map((panel) => \`\${panel.index}:\${panel.startValue}:\${panel.weeks.length}\`)
      .join("|");
    // 换了页或钻了层才重画；同页内移动焦点时格子原样留着
    if (signature === painted) {
      return;
    }
    painted = signature;
    const weekDays = picker.weekDays;
    // 快捷选项列写在模板里、排在日历前面，重画只换日历那几张
    for (const old of content.querySelectorAll(':scope > [data-xh-part="calendar"]')) {
      old.remove();
    }
    content.append(
      ...panels.map((panel, index) => panelOf(panel, index === panels.length - 1, weekDays)),
    );
  }

  // 段位是空节点：显示什么由组件按当前值填。「/」与「周」是普通节点，写在段位旁边
  function paintSegments(group, segments) {
    const out = [];
    segments.forEach((segment, index) => {
      if (index > 0) {
        out.push(node("span", undefined, "/"));
      }
      out.push(node("span", "segment"));
      if (segment.type === "week") {
        out.push(node("span", undefined, "周"));
      }
    });
    group.replaceChildren(...out);
  }

  // 元素一连上就能读 panels / fieldSegments，接线排在这之后，节点赶得上
  document.getElementById("date-range-picker-shortcuts-mount").append(fragment);
  paintSegments(groups[0], picker.fieldSegments);
  paintSegments(groups[1], picker.fieldEndSegments);
  paintPanels();

  picker.addEventListener("focused-value-change", paintPanels);
  picker.addEventListener("active-view-change", paintPanels);
<\/script>
`;export{e as default};
