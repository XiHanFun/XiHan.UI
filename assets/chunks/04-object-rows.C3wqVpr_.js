var e=`<!-- 多字段行 | 每行包含多个输入框 -->
<xh-field-array id="field-array-object" movable>
  <div data-xh-part="root" style="inline-size: 100%; max-inline-size: 480px">
    <button data-xh-part="add-trigger">+ 添加请求头</button>
  </div>
</xh-field-array>

<template id="field-array-object-row">
  <div data-xh-part="item">
    <div data-xh-part="item-content">
      <xh-text-field data-key="name" placeholder="字段名">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
      <xh-text-field data-key="value" placeholder="字段值">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" />
          </div>
        </div>
      </xh-text-field>
    </div>
    <div data-xh-part="item-action">
      <button data-xh-part="move-up-trigger"></button>
      <button data-xh-part="move-down-trigger"></button>
      <button data-xh-part="item-delete-trigger"></button>
    </div>
  </div>
</template>

<script type="module">
  const host = document.getElementById("field-array-object");
  const root = host.querySelector('[data-xh-part="root"]');
  const addTrigger = host.querySelector('[data-xh-part="add-trigger"]');
  const template = document.getElementById("field-array-object-row");

  let headers = [
    { name: "Accept", value: "application/json" },
    { name: "X-Trace", value: "" },
  ];

  // 改一个字段就整份重建数组，行号不跟着变
  function patch(index, key, next) {
    headers = headers.map((row, i) => (i === index ? { ...row, [key]: next } : row));
    host.value = headers;
  }

  function render() {
    for (const row of root.querySelectorAll('[data-xh-part="item"]')) row.remove();
    headers.forEach((value, index) => {
      const row = template.content.firstElementChild.cloneNode(true);
      root.insertBefore(row, addTrigger);
      // 文本框插进页面、升级之后再给值；给了值即受控，报上来的新值由这里写回。
      // 它的 value-change 会冒泡到字段数组上，这里截住，字段数组只听增删
      for (const field of row.querySelectorAll("xh-text-field")) {
        field.value = value[field.dataset.key];
        field.addEventListener("value-change", (event) => {
          event.stopPropagation();
          field.value = event.detail.value;
          patch(index, field.dataset.key, event.detail.value);
        });
      }
    });
  }

  host.createItem = () => ({ name: "", value: "" });
  host.value = headers;
  host.addEventListener("value-change", (event) => {
    headers = event.detail.value;
    host.value = headers;
    render();
  });

  render();
<\/script>
`;export{e as default};