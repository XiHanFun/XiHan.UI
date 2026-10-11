var e=`<!-- 基础用法 | 添加和删除重复字段 -->
<xh-field-array id="field-array-basic">
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 420px">
    <button data-xh-part="add-trigger">+ 添加链接</button>
  </div>
</xh-field-array>

<template id="field-array-basic-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <xh-text-field placeholder="填一个链接">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-basic");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-basic-row");

  let links = ["https://xihan.fun", ""];

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    links.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      root.insertBefore(row, addTrigger);
      // 文本框插进页面、升级之后再给值；给了值即受控，报上来的新值由这里写回。
      // 它的 value-change 会冒泡到字段数组上，这里截住，字段数组只听增删
      const field = row.querySelector("xh-text-field");
      field.value = value;
      field.addEventListener("value-change", (event) => {
        event.stopPropagation();
        field.value = event.detail.value;
        links = links.map((item, i) => (i === index ? event.detail.value : item));
        host.value = links;
      });
    });
  }

  host.createItem = () => "";
  host.value = links;
  // 值给了即受控，增删只发通知，改动由宿主自己写回
  host.addEventListener("value-change", (event) => {
    links = event.detail.value;
    host.value = links;
    render();
  });

  render();
<\/script>
`;export{e as default};