const e=`<!-- 只用输入框 | 加减钮是可选部件，不渲染它照样能改值：方向键走 step，PageUp 与 PageDown 走 largeStep -->
<xh-number-field
  id="number-field-no-trigger"
  default-value="60"
  min="0"
  max="100"
  step="5"
  large-step="25"
>
  <div data-xh-part="root">
    <label data-xh-part="label">音量（0 – 100，每档 5）</label>
    <input data-xh-part="input" style="inline-size: 96px; text-align: center" />
    <span>点进框里按上下键：<span id="number-field-no-trigger-value">60</span></span>
  </div>
</xh-number-field>

<script type="module">
  // 值从事件明细里取，原样回显
  const field = document.getElementById("number-field-no-trigger");
  const readout = document.getElementById("number-field-no-trigger-value");

  field.addEventListener("value-change", (event) => {
    readout.textContent = event.detail.value === "" ? "（空）" : event.detail.value;
  });
<\/script>
`;export{e as default};
