var e=`<!-- 插入与任意换位 | insert(index) 在指定位置插入一行，后面的行往后挪；move(from, to) 一步挪到任意位置，不必逐格上移 -->
<xh-field-array id="field-array-insert" movable>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <button data-xh-part="add-trigger">+ 添加一步</button>
  </div>
</xh-field-array>

<template id="field-array-insert-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <span style="inline-size: 1.5rem"></span>
      <xh-text-field placeholder="这一步做什么">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
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
      // 插入与换位走元素的命令式方法，结果经 value-change 回来
      row.querySelector('[data-action="insert"]').addEventListener("click", () => host.insert(index + 1));
      const top = row.querySelector('[data-action="top"]');
      if (index === 0) top.setAttribute("disabled", "");
      top.addEventListener("click", () => host.move(index, 0));
      root.insertBefore(row, addTrigger);
      // 文本框插进页面、升级之后再给值；给了值即受控，报上来的新值由这里写回。
      // 它的 value-change 会冒泡到字段数组上，这里截住，字段数组只听增删
      const field = row.querySelector("xh-text-field");
      field.value = value;
      field.addEventListener("value-change", (event) => {
        event.stopPropagation();
        field.value = event.detail.value;
        steps = steps.map((item, i) => (i === index ? event.detail.value : item));
        host.value = steps;
      });
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