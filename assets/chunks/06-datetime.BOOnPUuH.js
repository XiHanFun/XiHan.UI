var e=`<!-- 日期加时间 | showTime 让起止都带上时刻，defaultTime 在只点日期时补 00:00:00 与 23:59:59；起止同一天时终点早于起点的时刻不可选，由确认钮收口 -->
<div id="date-range-picker-datetime-mount"></div>
<span aria-live="polite" style="font-size: 13px">当前值：<span id="date-range-picker-datetime-value">（未填齐）</span></span>

<template id="date-range-picker-datetime-template">
  <xh-date-range-picker locale="zh-CN" show-time time-granularity="second">
    <div data-xh-part="root">
      <span data-xh-part="label">查询区间</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group"></div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <!-- 起止各一组时间列：组自报 index，列自报 unit，格自报两位补零的 value -->
          <div data-xh-part="column-group" index="0">
            <div data-xh-part="column-group-label">开始时间</div>
            <div data-xh-part="time-column" unit="hour"></div>
            <div data-xh-part="time-column" unit="minute"></div>
            <div data-xh-part="time-column" unit="second"></div>
          </div>
          <div data-xh-part="column-group" index="1">
            <div data-xh-part="column-group-label">结束时间</div>
            <div data-xh-part="time-column" unit="hour"></div>
            <div data-xh-part="time-column" unit="minute"></div>
            <div data-xh-part="time-column" unit="second"></div>
          </div>
          <button data-xh-part="confirm-trigger">确定</button>
        </div>
      </div>
    </div>
  </xh-date-range-picker>
</template>

<script type="module">
  const fragment = document.getElementById("date-range-picker-datetime-template").content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-range-picker");
  const groups = picker.querySelectorAll('[data-xh-part="segment-group"]');
  const content = picker.querySelector('[data-xh-part="content"]');
  const firstColumnGroup = picker.querySelector('[data-xh-part="column-group"]');
  const readout = document.getElementById("date-range-picker-datetime-value");

  // 数组与对象只能走 property：只点日期时两端各补的时刻、两组时间列的名字
  picker.defaultTime = ["00:00:00", "23:59:59"];
  picker.translations = { startTime: "开始时间", endTime: "结束时间", hour: "时", minute: "分", second: "秒" };

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

  function calendarOf(panel, weekDays) {
    const calendar = node("div", "calendar");
    const header = node("div", "header");
    const heading = node("div", "heading", panel.headingLabel);
    header.append(pageTrigger("prev-trigger", "上个月"), heading, pageTrigger("next-trigger", "下个月"));
    const grid = node("div", "grid");
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
    calendar.append(header, grid);
    return calendar;
  }

  // 已经画出来的是哪一页；日历排在两组时间列前面
  let painted = "";

  function paintCalendar() {
    const panel = picker.panels[0];
    if (!panel || panel.startValue === painted) {
      return;
    }
    painted = panel.startValue;
    content.querySelector(':scope > [data-xh-part="calendar"]')?.remove();
    content.insertBefore(calendarOf(panel, picker.weekDays), firstColumnGroup);
  }

  function literalBefore(type, index) {
    if (index === 0) return "";
    if (type === "hour") return " ";
    if (type === "minute" || type === "second") return ":";
    return "/";
  }

  // 段位是空节点：显示什么由组件按当前值填；分隔符是普通节点
  function paintSegments(group, segments) {
    const out = [];
    segments.forEach((segment, index) => {
      if (index > 0) {
        out.push(node("span", undefined, literalBefore(segment.type, index)));
      }
      out.push(node("span", "segment"));
    });
    group.replaceChildren(...out);
  }

  // 时列 24 格、分列与秒列各 60 格：先铺好再入页，接线那一刻格子已经在了
  function paintTimeColumns() {
    for (const column of picker.querySelectorAll('[data-xh-part="time-column"]')) {
      const count = column.getAttribute("unit") === "hour" ? 24 : 60;
      const items = [];
      for (let i = 0; i < count; i++) {
        const item = node("div", "time-item", \`\${i}\`.padStart(2, "0"));
        item.setAttribute("value", \`\${i}\`.padStart(2, "0"));
        items.push(item);
      }
      column.replaceChildren(...items);
    }
  }

  paintTimeColumns();
  document.getElementById("date-range-picker-datetime-mount").append(fragment);
  paintSegments(groups[0], picker.fieldSegments);
  paintSegments(groups[1], picker.fieldEndSegments);
  paintCalendar();

  picker.addEventListener("focused-value-change", paintCalendar);
  picker.addEventListener("value-change", (event) => {
    const [start, end] = event.detail.value;
    readout.textContent = start && end ? \`\${start} → \${end}\` : "（未填齐）";
  });
<\/script>
`;export{e as default};