const n=`<!-- 基础用法 | 输入或选择日期 -->
<div id="date-picker-basic-mount"></div>

<template id="date-picker-basic-template">
  <xh-date-picker locale="zh-CN">
    <div data-xh-part="root">
      <span data-xh-part="label">交付日期</span>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
          <span>-</span>
          <span data-xh-part="segment"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
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
        </div>
      </div>
    </div>
  </xh-date-picker>
</template>

<script type="module">
  const fragment = document
    .getElementById("date-picker-basic-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');

  // 已经画出来的是哪个月
  let month = "";

  // 表头七列只跟 locale 走，画一次就够
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

  // 换了月才重画格子：同月内移动焦点时格子原样留着，选中态与焦点态由元素自己写
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

  // 元素一连上就能读 weeks / weekDays，接线排在这之后，格子赶得上
  document.getElementById("date-picker-basic-mount").append(fragment);
  paintHead();
  paintBody();

  picker.addEventListener("focused-value-change", paintBody);
<\/script>
`;export{n as default};
