const n=`<!-- 可选时段 | min/max 把界外的格从两组列里裁掉，另一端一填全再各自收窄一次 -->
<div id="time-range-picker-bounds"></div>
<span aria-live="polite" style="font-size: 13px">
  当前值：<span id="time-range-picker-bounds-value">（未填齐）</span>
</span>

<!-- 结构先收在模板里：两组列里的格子要在元素接线前就位，所以铺满了才入页 -->
<template id="time-range-picker-bounds-shell">
  <xh-time-range-picker min="08:00" max="20:00" step="30">
    <div data-xh-part="root">
      <label data-xh-part="label">预约时段</label>
      <div data-xh-part="control">
        <!-- 文档序在前的这组认领起点，在后的认领终点；也可以像这里一样显式写 index -->
        <div data-xh-part="segment-group" index="0">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <span data-xh-part="range-separator">-</span>
        <div data-xh-part="segment-group" index="1">
          <span data-xh-part="segment" segment="hour"></span>
          <span>:</span>
          <span data-xh-part="segment" segment="minute"></span>
        </div>
        <button data-xh-part="clear-trigger"></button>
        <button data-xh-part="trigger"></button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <!-- 起止各一组时列：列里的格子由脚本按 columnGroups 铺 -->
          <div data-xh-part="column-group" index="0">
            <div data-xh-part="column-group-label">开始</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
          <div data-xh-part="column-group" index="1">
            <div data-xh-part="column-group-label">结束</div>
            <div data-xh-part="column" unit="hour"></div>
            <div data-xh-part="column" unit="minute"></div>
          </div>
        </div>
      </div>
    </div>
  </xh-time-range-picker>
</template>

<script type="module">
  const stage = document.getElementById("time-range-picker-bounds");
  const readout = document.getElementById("time-range-picker-bounds-value");
  const node = document.getElementById("time-range-picker-bounds-shell").content.cloneNode(true);
  const picker = node.querySelector("xh-time-range-picker");
  // 浮层展开后 content 会被搬到落点，之后从元素往下查不到它；先把它记住
  const content = picker.querySelector('[data-xh-part="content"]');

  // 每列上一次画的是哪一串值，没变就不动它（正在用方向键走的那一列不该被换掉）
  const painted = new Map();

  function itemNode(value) {
    const cell = document.createElement("div");
    cell.dataset.xhPart = "item";
    cell.setAttribute("value", value);
    // 格子上的字由组件按 locale 填
    return cell;
  }

  // 两组各自该排哪几列、每列有哪些格由组件给：越界的、不合 step 的、被另一端顶住的，都已经不在里面
  function paint() {
    content.querySelectorAll('[data-xh-part="column-group"]').forEach((group, index) => {
      const columns = picker.columnGroups[index].columns;
      for (const column of group.querySelectorAll('[data-xh-part="column"]')) {
        const unit = column.getAttribute("unit");
        const options = columns.find((c) => c.unit === unit)?.options ?? [];
        const shape = options.join(",");
        if (painted.get(column) === shape) continue;
        painted.set(column, shape);
        column.replaceChildren(...options.map(itemNode));
      }
    });
  }

  function show([start, end]) {
    readout.textContent = start && end ? \`\${start} → \${end}\` : "（未填齐）";
  }

  picker.addEventListener("value-change", async (event) => {
    picker.value = event.detail.value;
    show(event.detail.value);
    // 受控值要等元素这一轮更新把它送进机器，之后读到的两组列才是按新值裁过的
    await picker.updateComplete;
    paint();
  });
  // 挑一格、敲一个数字都可能让别的列跟着收窄；浮层被搬走后事件不再经过元素，
  // 所以挂在 content 自己身上，等机器处理完这一下再重读一遍
  for (const type of ["click", "keydown"])
    content.addEventListener(type, () => queueMicrotask(paint));

  // 元素一连上就能读 columnGroups；接线排在微任务里，同步铺好的格子赶得上。
  // 数组只走 property；值由宿主持有，事件里写回才生效
  const initial = ["10:00", ""];
  stage.append(node);
  picker.value = initial;
  paint();
  show(initial);
<\/script>
`;export{n as default};
