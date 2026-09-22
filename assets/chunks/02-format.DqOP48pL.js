const a=`<!-- 写法与透明度 | 手动输入的任何写法提交后都按 format 重写；开启 alpha 才保留透明度，配合 rgba 写法一目了然 -->
<div style="display: flex; flex-direction: column; gap: 8px">
  <!-- 试着打 #3b82f680 或 hsl(217 91% 60% / 50%)，收下后都变成 rgba() -->
  <xh-color-field id="color-field-format" default-value="rgba(59, 130, 246, 0.5)" format="rgba" alpha placeholder="rgba(r, g, b, a)">
    <div data-xh-part="root">
      <label data-xh-part="label">遮罩色</label>
      <div data-xh-part="control">
        <span data-xh-part="swatch"></span>
        <input data-xh-part="input" />
      </div>
    </div>
  </xh-color-field>
  <span style="font-size: 13px">收下的值：<code id="color-field-format-value">rgba(59, 130, 246, 0.5)</code></span>
</div>

<script type="module">
  const field = document.getElementById("color-field-format");
  const readout = document.getElementById("color-field-format-value");
  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value || "（空）";
  });
<\/script>
`;export{a as default};
