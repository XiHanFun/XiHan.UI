const e=`<!-- 固定小数位 | 步进本身带定点规整，宿主在离开输入框与松开加减钮时把值补齐到两位小数 -->
<xh-number-field id="number-field-precision" value="12.50" min="0" max="999" step="0.1">
  <div data-xh-part="root">
    <label data-xh-part="label">单价（每档 0.1）</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger">−</button>
      <button data-xh-part="increment-trigger">+</button>
    </div>
    <span>当前：<span id="number-field-precision-value">12.50</span></span>
  </div>
</xh-number-field>

<script type="module">
  // 值握在这里，组件报出变化后写回
  const field = document.getElementById("number-field-precision");
  const readout = document.getElementById("number-field-precision-value");

  function setValue(next) {
    field.value = next;
    readout.textContent = next || "（空）";
  }

  // 补齐两位小数；空值与非法值一律留空
  function pad() {
    const n = Number(field.value);
    setValue(field.value === "" || !Number.isFinite(n) ? "" : n.toFixed(2));
  }

  // 补齐排在本轮事件全部走完之后一拍，组件自己的失焦规范化先落地
  const padLater = () => setTimeout(pad);

  field.addEventListener("value-change", (event) => setValue(event.detail.value));
  field.querySelector('[data-xh-part="input"]').addEventListener("blur", padLater);

  for (const trigger of field.querySelectorAll('[data-xh-part$="-trigger"]')) {
    trigger.addEventListener("pointerup", padLater);
  }
<\/script>
`;export{e as default};
