const e=`<!-- 多选成标签 | selectionMode="multiple" 时选中的日期在输入行里排成标签，点标签上的叉或在日历钮上按退格摘掉，放不下的折进 +N；浮层选完不收起 -->
<div id="date-picker-multiple-mount"></div>

<template id="date-picker-multiple-template">
  <xh-date-picker locale="zh-CN" name="duty-days" selection-mode="multiple" placeholder="选择值班日期">
    <div
      data-xh-part="root"
    >
      <span data-xh-part="label">值班日期</span>
      <div data-xh-part="control">
        <span data-xh-part="tag-list"></span>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <input data-xh-part="hidden-input" />
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
    .getElementById("date-picker-multiple-template")
    .content.cloneNode(true);
  const picker = fragment.querySelector("xh-date-picker");
  const heading = fragment.querySelector('[data-xh-part="heading"]');
  const head = fragment.querySelector(
    '[data-xh-part="grid-head"] [data-xh-part="week-row"]',
  );
  const body = fragment.querySelector('[data-xh-part="grid-body"]');
  const tagList = fragment.querySelector('[data-xh-part="tag-list"]');

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

  // 标签按 tags 铺：一个选中值一枚，带删除钮；放不下的那些合成一枚 +N，文字由元素填
  function paintTags() {
    tagList.replaceChildren(
      ...picker.tags.map((tag) => {
        const node = document.createElement("span");
        node.dataset.xhPart = "tag";
        node.setAttribute("value", tag.value);
        const label = document.createElement("span");
        label.dataset.xhPart = "tag-label";
        label.textContent = tag.label;
        const remove = document.createElement("button");
        remove.dataset.xhPart = "item-delete-trigger";
        node.append(label, remove);
        return node;
      }),
      overflowTag(),
    );
  }

  // +N 那一枚：留空，文字由元素填
  function overflowTag() {
    const node = document.createElement("span");
    node.dataset.xhPart = "overflow-tag";
    return node;
  }

  // 多选的值是数组，只走 property
  picker.defaultValue = ["2026-10-08", "2026-10-15", "2026-10-22", "2026-10-29"];

  // 元素一连上就能读 weeks / weekDays，接线排在这之后，格子赶得上
  document.getElementById("date-picker-multiple-mount").append(fragment);
  paintHead();
  paintBody();
  paintTags();

  picker.addEventListener("focused-value-change", paintBody);
  picker.addEventListener("value-change", paintTags);
<\/script>
`;export{e as default};
