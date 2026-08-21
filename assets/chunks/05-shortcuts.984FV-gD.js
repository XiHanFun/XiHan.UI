const e=`<!-- 快捷选项 | presets 在浮层里排出一列，点一条整份写进去并收起；日子在组件外算好再传 -->
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
          <div data-xh-part="presets"></div>
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
  const list = fragment.querySelector('[data-xh-part="presets"]');
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

  // 示例台不能 import 包，这里把 datePickerPresetDay 做的事等价地写一遍；
  // 真实项目里从 @xihan-ui/headless 引它，还有 -Range / -Month / -Year 三个
  function shift(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    const month = \`\${d.getMonth() + 1}\`.padStart(2, "0");
    const day = \`\${d.getDate()}\`.padStart(2, "0");
    return \`\${d.getFullYear()}-\${month}-\${day}\`;
  }

  // 日子算一次就固定下来，组件只认已经算好的字面值
  const presets = [
    { label: "今天", value: shift(0) },
    { label: "明天", value: shift(1) },
    { label: "一周后", value: shift(7) },
  ];

  // 条目由作者铺，身份写在 value 属性上；元素只负责把行为打上去
  list.replaceChildren(
    ...presets.map((preset) => {
      const item = document.createElement("div");
      item.dataset.xhPart = "preset";
      item.setAttribute("value", preset.value);
      item.textContent = preset.label;
      return item;
    }),
  );
  picker.presets = presets;

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
`;export{e as default};
