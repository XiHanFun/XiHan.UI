const t=`<!-- 换序 | movable 开了才出上下把手；挪完焦点跟着这一行走，键盘可以连按一路挪到底 -->
<xh-dynamic-input id="dynamic-input-movable" movable>
  <div data-xh-part="root" style="max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加一步</button>
    <p id="dynamic-input-movable-order">顺序：</p>
  </div>
</xh-dynamic-input>

<template id="dynamic-input-movable-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <span style="inline-size: 1.5rem"></span>
      <input style="inline-size: 100%" placeholder="这一步做什么" />
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="move-up-trigger"></button>
      <button data-xh-part="move-down-trigger"></button>
      <button data-xh-part="remove-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("dynamic-input-movable");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("dynamic-input-movable-row");
  const order = document.getElementById("dynamic-input-movable-order");

  let steps = ["拉取代码", "安装依赖", "跑构建", "发布"];

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
      root.insertBefore(row, addTrigger);
    });
    order.textContent = \`顺序：\${steps.join(" → ")}\`;
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
`;export{t as default};
