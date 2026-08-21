const e=`<!-- 基础用法 | 网格由作者照 weeks / weekDays 自己渲染，组件一个节点都不替你生成 -->
<div id="calendar-basic-mount"></div>
<span style="font-size: 13px">选中：<span id="calendar-basic-value">（未选）</span></span>

<!-- 结构先收在模板里：必需的格子要在元素接线前就位，所以网格填好了才入页 -->
<template id="calendar-basic-template">
  <xh-calendar locale="zh-CN" fixed-weeks>
    <div data-xh-part="root" style="max-inline-size: 280px">
      <div data-xh-part="header">
        <!-- 箭头字符念不出「上个月」，可及名字得自己给 -->
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
  </xh-calendar>
</template>

<script type="module">
  const fragment = document
    .getElementById("calendar-basic-template")
    .content.cloneNode(true);
  const calendar = fragment.querySelector("xh-calendar");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector('[data-xh-part="grid-head"] [data-xh-part="week-row"]');
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const readout = document.getElementById("calendar-basic-value");

  // 已经画出来的是哪个月
  let month = "";

  // 表头七列只跟 locale 走，画一次就够
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

  // 换了月才重画格子：同月内移动焦点时格子原样留着，选中态与焦点态由元素自己写
  function paintBody() {
    const first = calendar.weeks[0][0].value;
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
  document.getElementById("calendar-basic-mount").append(fragment);
  paintHead();
  paintBody();

  calendar.addEventListener("focused-value-change", paintBody);
  calendar.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
<\/script>
`;export{e as default};
