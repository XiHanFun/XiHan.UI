const e=`<!-- 多选 | selection-mode=multiple：点击一次加入，再点击一次移除，集合按日期升序 -->
<div id="calendar-picker-multiple-mount"></div>
<span style="font-size: 13px">已选：<span id="calendar-picker-multiple-value">2026-09-08、2026-09-15、2026-09-22</span></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-picker-multiple-template">
  <xh-calendar-picker locale="zh-CN" selection-mode="multiple" default-focused-value="2026-09-13" fixed-weeks>
    <div data-xh-part="root" style="max-inline-size: 280px">
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
  </xh-calendar-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-picker-multiple-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("calendar-picker-multiple-value");
  // 多选的值是数组，只能走 property
  calendar.defaultValue = ["2026-09-08", "2026-09-15", "2026-09-22"];

  let month = "";

  function paintHead() {
    head.replaceChildren(
      ...calendar.weekDays.map((day) => {
        const cell = document.createElement("span");
        cell.dataset.xhPart = "week-day";
        cell.setAttribute("value", day.value);
        cell.textContent = day.label;
        return cell;
      }),
    );
  }

  // 换了月才重画格子：同月内点选时格子原样留着，选中态由元素自己写
  function paintBody() {
    const first = calendar.weeks[0][0].start;
    if (first === month) {
      return;
    }
    month = first;
    heading.textContent = calendar.headingLabel;
    body.replaceChildren(
      ...calendar.weeks.map((week) => {
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

  document.getElementById("calendar-picker-multiple-mount").append(fragment);
  paintHead();
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{e as default};
