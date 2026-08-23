const t=`<!-- 禁用 / 只读 / 校验失败 | 禁用整条退出 Tab 序，只读仍能展开浏览只是改不动值，invalid 只改标注 -->
<div id="time-picker-state" style="display: grid; gap: 16px; justify-items: start"></div>

<!-- 结构先收在模板里：列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-picker-state-shell">
  <xh-time-picker default-value="09:30">
    <div data-xh-part="root">
      <label data-xh-part="label"></label>
      <div data-xh-part="control">
        <div data-xh-part="segment-group">
          <span data-xh-part="input" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="input" segment="minute"></span>
        </div>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="column" unit="hour"></div>
          <div data-xh-part="column" unit="minute"></div>
        </div>
      </div>
    </div>
  </xh-time-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-picker-state");
  const shell = document.getElementById("time-picker-state-shell");

  // 往一列里铺 count 格，值是两位补零的显示串
  function fill(column, count) {
    for (let i = 0; i < count; i++) {
      const item = document.createElement("div");
      item.dataset.xhPart = "item";
      item.setAttribute("value", String(i).padStart(2, "0"));
      column.append(item);
    }
  }

  const states = [
    { label: "禁用", flag: "disabled" },
    { label: "只读", flag: "read-only" },
    { label: "校验失败", flag: "invalid" },
  ];

  for (const state of states) {
    const node = shell.content.cloneNode(true);
    node.querySelector("xh-time-picker").setAttribute(state.flag, "");
    node.querySelector('[data-xh-part="label"]').textContent = state.label;
    fill(node.querySelector('[unit="hour"]'), 24);
    fill(node.querySelector('[unit="minute"]'), 60);
    stage.append(node);
  }
<\/script>
`;export{t as default};
