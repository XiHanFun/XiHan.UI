const e=`<!-- 基础用法 | 框里的字是草稿，回车或失焦收下后按 format 重写；色块画的是收下的值，半截字不会被提交 -->
<div style="display: flex; flex-direction: column; gap: 8px">
  <xh-color-field id="color-field-basic" default-value="#3b82f6" name="accent" placeholder="#rrggbb" clearable>
    <div data-xh-part="root">
      <label data-xh-part="label">主题色</label>
      <div data-xh-part="control" style="inline-size: 16rem">
        <span data-xh-part="swatch"></span>
        <input data-xh-part="input" />
        <button data-xh-part="clear-trigger"></button>
      </div>
      <input data-xh-part="hidden-input" />
    </div>
  </xh-color-field>
  <span style="font-size: 13px">收下的值：<code id="color-field-basic-value">#3b82f6</code></span>
</div>

<script type="module">
  // 打字途中不发事件，只有收下的值才到这里
  const field = document.getElementById("color-field-basic");
  const readout = document.getElementById("color-field-basic-value");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
<\/script>
`;export{e as default};
