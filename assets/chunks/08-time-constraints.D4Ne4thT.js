var e=`<!-- 可约时段 | timeStep 让分列每 15 分钟一格；min / max 带时间段时首尾两天界外的时刻不可选，isTimeUnavailable 再按已选的日子收掉周末的下午 -->
<div id="date-picker-time-constraints-mount"></div>
<span style="font-size: 13px">当前值：<span id="date-picker-time-constraints-value">2026-10-09T10:00</span></span>

<template id="date-picker-time-constraints-template">
  <xh-date-picker locale="zh-CN" show-time min="2026-10-09T09:00" max="2026-10-31T18:00" time-step='{"minute":15}' default-value="2026-10-09T10:00">
    <div data-xh-part="root">
      <span data-xh-part="label">到店时间</span>
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
                <button data-xh-part="prev-trigger" aria-label="上个月"></button>
                <div data-xh-part="heading"></div>
                <button data-xh-part="next-trigger" aria-label="下个月"></button>
              </div>
              <div data-xh-part="grid">
                <div data-xh-part="grid-head">
                  <div data-xh-part="week-row"></div>
                </div>
                <div data-xh-part="grid-body"></div>
              </div>
            </div>
            <!-- 时列 0-23、分列每 15 分钟一格；界外与判为不可用的格留在列里、按不下去 -->
            <div data-xh-part="time-column" unit="hour"></div>
            <div data-xh-part="time-column" unit="minute"></div>
          </div>
          <div style="display: flex; align-items: center; justify-content: flex-end; margin-block-start: var(--xh-space-2); margin-inline: calc(-1 * var(--xh-space-2)); margin-block-end: calc(-1 * var(--xh-space-2)); padding-block: var(--xh-space-1); padding-inline: var(--xh-space-2); border-block-start: var(--xh-stroke-thin) solid var(--xh-border-subtle)">
            <button data-xh-part="confirm-trigger">确定</button>
          </div>
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-time-constraints-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const segmentGroup = fragment.querySelector('[data-xh-part="segment-group"]');
  const readout = document.getElementById("date-picker-time-constraints-value");

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
    if (type === "hour") return " ";
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
  paintTimeColumn("hour", Array.from({ length: 24 }, (_, i) => pad(i)));
  paintTimeColumn("minute", Array.from({ length: 4 }, (_, i) => pad(i * 15)));

  // 周末只接上午：判定收到这份时间所属的日期，时列的值恒按 24 小时制给
  picker.isTimeUnavailable = (option, unit, context) => {
    if (unit !== "hour" || context.date == null) return false;
    const day = new Date(\`\${context.date}T00:00:00Z\`).getUTCDay();
    return (day === 0 || day === 6) && Number(option) >= 12;
  };

  document.getElementById("date-picker-time-constraints-mount").append(fragment);
  paintSegments();
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
  picker.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（空）";
  });
<\/script>
`;export{e as default};