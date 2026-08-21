const t=`<!-- 浮层里的快捷选项 | 日历下面这排按钮是作者自己的节点，点它把值写下、把浮层一并收起 -->
<div id="date-picker-shortcuts-mount"></div>
<span style="font-size: 13px">
  当前值：<span id="date-picker-shortcuts-value">（未选）</span>
</span>

<template id="date-picker-shortcuts-template">
  <xh-date-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label">提醒日期</span>
      <div data-xh-part="control">
        <div data-xh-part="input">
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
        <button data-xh-part="clear-trigger">✕</button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="calendar">
            <div data-xh-part="header">
              <button data-xh-part="prev-trigger" aria-label="上个月">‹</button>
              <div data-xh-part="heading"></div>
              <button data-xh-part="next-trigger" aria-label="下个月">›</button>
            </div>
            <div data-xh-part="grid">
              <div data-xh-part="grid-head">
                <div data-xh-part="week-row"></div>
              </div>
              <div data-xh-part="grid-body"></div>
            </div>
          </div>
          <div data-shortcuts style="display: flex; gap: 8px; margin-block-start: 12px"></div>
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-shortcuts-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const bar = fragment.querySelector("[data-shortcuts]");
  const readout = document.getElementById("date-picker-shortcuts-value");

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
    const first = picker.weeks[0][0].value;
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
          cell.setAttribute("value", day.value);
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

  // 相对今天偏移若干天的 ISO 串
  function shift(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const month = \`\${d.getMonth() + 1}\`.padStart(2, "0");
    const day = \`\${d.getDate()}\`.padStart(2, "0");
    return \`\${d.getFullYear()}-\${month}-\${day}\`;
  }

  const shortcuts = [
    { label: "今天", value: shift(0) },
    { label: "明天", value: shift(1) },
    { label: "一周后", value: shift(7) },
  ];

  bar.replaceChildren(
    ...shortcuts.map((shortcut) => {
      const host = document.createElement("xh-button");
      host.setAttribute("size", "sm");
      host.setAttribute("variant", "outline");
      const button = document.createElement("button");
      button.dataset.xhPart = "root";
      button.textContent = shortcut.label;
      // 选中值恒为数组，写一天也要装进数组里
      button.addEventListener("click", () => {
        setValue([shortcut.value]);
        setOpen(false);
      });
      host.append(button);
      return host;
    }),
  );

  // 值与展开态都由这段脚本持有：组件只发意图，写回才算数
  function setValue(value) {
    picker.value = value;
    readout.textContent = value[0] ?? "（未选）";
  }

  function setOpen(open) {
    picker.open = open;
  }

  document.getElementById("date-picker-shortcuts-mount").append(fragment);
  setValue([]);
  setOpen(false);
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
  picker.addEventListener("value-change", (event) => setValue(event.detail.value));
  picker.addEventListener("open-change", (event) => setOpen(event.detail.open));
<\/script>
`;export{t as default};
