var e=`<!-- 12 小时制 | hourCycle=12 时时间列末位多出上下午列，输入行也多出上下午段；值仍是 24 小时制的 ISO 串 -->
<div id="date-picker-hour-cycle-mount"></div>
<span style="font-size: 13px">当前值：<span id="date-picker-hour-cycle-value">2026-09-28T21:30</span></span>

<template id="date-picker-hour-cycle-template">
  <xh-date-picker locale="en-US" show-time hour-cycle="12" default-value="2026-09-28T21:30">
    <div data-xh-part="root">
      <span data-xh-part="label">Pickup</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group"></div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div style="display: flex; align-items: stretch">
            <div data-xh-part="calendar">
              <div data-xh-part="header">
                <button data-xh-part="prev-trigger" aria-label="Previous month"></button>
                <div data-xh-part="heading"></div>
                <button data-xh-part="next-trigger" aria-label="Next month"></button>
              </div>
              <div data-xh-part="grid">
                <div data-xh-part="grid-head">
                  <div data-xh-part="week-row"></div>
                </div>
                <div data-xh-part="grid-body"></div>
              </div>
            </div>
            <!-- 时列 1-12、分列 0-59，上下午列两格的字留空，由元素按 locale 填 -->
            <div data-xh-part="time-column" unit="hour"></div>
            <div data-xh-part="time-column" unit="minute"></div>
            <div data-xh-part="time-column" unit="dayPeriod">
              <div data-xh-part="time-item" value="00"></div>
              <div data-xh-part="time-item" value="01"></div>
            </div>
          </div>
          <div style="display: flex; align-items: center; justify-content: flex-end; margin-block-start: var(--xh-space-2); margin-inline: calc(-1 * var(--xh-space-2)); margin-block-end: calc(-1 * var(--xh-space-2)); padding-block: var(--xh-space-1); padding-inline: var(--xh-space-2); border-block-start: var(--xh-stroke-thin) solid var(--xh-border-subtle)">
            <button data-xh-part="confirm-trigger">OK</button>
          </div>
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-hour-cycle-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const segmentGroup = fragment.querySelector('[data-xh-part="segment-group"]');
  const readout = document.getElementById("date-picker-hour-cycle-value");

  let month = "";

  function paintHead() {
    head.replaceChildren(
      ...picker.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  function paintBody() {
    const first = picker.weeks[0][0].start;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = picker.headingLabel;
    body.replaceChildren(
      ...picker.weeks.map((week) => {
        const row = document.createElement("div");
        row.dataset.xhPart = "week-row";
        for (const day of week) {
          const cell = document.createElement("div");
          cell.dataset.xhPart = "cell";
          cell.setAttribute("value", day.start);
          const trigger = document.createElement("div");
          trigger.dataset.xhPart = "cell-trigger";
          trigger.textContent = day.day;
          cell.append(trigger);
          row.append(cell);
        }
        return row;
      }),
    );
  }

  function literalBefore(type, index) {
    if (index === 0) return "";
    if (type === "hour" || type === "dayPeriod") return " ";
    if (type === "minute") return ":";
    return "/";
  }

  function paintSegments() {
    const out = [];
    picker.fieldSegments.forEach((segment, index) => {
      if (index > 0) {
        const literal = document.createElement("span");
        literal.textContent = literalBefore(segment.type, index);
        out.push(literal);
      }
      const item = document.createElement("span");
      item.dataset.xhPart = "segment";
      out.push(item);
    });
    segmentGroup.replaceChildren(...out);
  }

  function paintTimeColumn(unit, values) {
    const column = fragment.querySelector(
      \`[data-xh-part="time-column"][unit="\${unit}"]\`,
    );
    column.replaceChildren(
      ...values.map((value) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "time-item";
        item.setAttribute("value", value);
        item.textContent = value;
        return item;
      }),
    );
  }

  const pad = (n) => \`\${n}\`.padStart(2, "0");
  // 12 小时制的时列是 1-12
  paintTimeColumn("hour", Array.from({ length: 12 }, (_, i) => pad(i + 1)));
  paintTimeColumn("minute", Array.from({ length: 60 }, (_, i) => pad(i)));

  document.getElementById("date-picker-hour-cycle-mount").append(fragment);
  paintSegments();
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（空）";
  });
<\/script>
`;export{e as default};