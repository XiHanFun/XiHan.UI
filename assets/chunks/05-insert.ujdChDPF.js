var e=`<!-- 插入与任意换位 | insert(index) 在指定位置插入一行，后面的行往后挪；move(from, to) 一步挪到任意位置，不必逐格上移 -->
<xh-field-array id="field-array-insert" movable>
  <div data-xh-part="root" style="max-inline-size: 480px">
    <button data-xh-part="add-trigger">+ 添加一步</button>
  </div>
</xh-field-array>

<template id="field-array-insert-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <span style="inline-size: 1.5rem"></span>
      <input class="xh-demo-control" style="inline-size: 100%" placeholder="这一步做什么" />
    </div>
    <div data-xh-part="item-action">
      <xh-button size="sm" variant="ghost" data-action="insert"><button data-xh-part="root">下方插入</button></xh-button>
      <xh-button size="sm" variant="ghost" data-action="top"><button data-xh-part="root">置顶</button></xh-button>
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-insert");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-insert-row");

  let steps = ["拉取代码", "跑构建", "发布"];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    steps.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      row.querySelector("span").textContent = \`\${index + 1}.\`;
      const input = row.querySelector("input");
      input.value = value;
      input.addEventListener("input", () => {
        steps = steps.map((item, i) => (i === index ? input.value : item));
        host.value = steps;
      });
      // 插入与换位走元素的命令式方法，结果经 value-change 回来
      row.querySelector('[data-action="insert"]').addEventListener("click", () => host.insert(index + 1));
      const top = row.querySelector('[data-action="top"]');
      if (index === 0) top.setAttribute("disabled", "");
      top.addEventListener("click", () => host.move(index, 0));
      root.insertBefore(row, addTrigger);
    });
  }

  host.createItem = () => "";
  host.value = steps;
  host.addEventListener("value-change", (event) => {
    steps = event.detail.value;
    host.value = steps;
    render();
  });

  render();
<\/script>
`;export{e as default};