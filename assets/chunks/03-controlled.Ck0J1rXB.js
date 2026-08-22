const e=`<!-- 受控 | 传了 value 就由宿主说了算；value-change 除了原始串还带一份 valueAsNumber -->
<xh-number-field id="number-field-controlled" value="3" min="0" max="99">
  <div data-xh-part="root">
    <label data-xh-part="label">数量</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
<span>
  输入串：<span id="number-field-controlled-text">3</span> ·
  数值：<span id="number-field-controlled-number">3</span>
</span>

<script type="module">
  // 值只在这里写，写回去组件才动
  const field = document.getElementById("number-field-controlled");
  const text = document.getElementById("number-field-controlled-text");
  const number = document.getElementById("number-field-controlled-number");

  field.addEventListener("value-change", (event) => {
    field.value = event.detail.value;
    text.textContent = event.detail.value === "" ? "（空）" : event.detail.value;
    number.textContent = String(event.detail.valueAsNumber);
  });
<\/script>
`;export{e as default};
