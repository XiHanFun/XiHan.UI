const e=`<!-- 区间与步长 | 方向键走 step，PageUp 与 PageDown 走 largeStep，Home 与 End 取端点；贴到边界时对应按钮转灰 -->
<xh-number-field
  id="number-field-range"
  default-value="10"
  min="0"
  max="20"
  step="2"
  large-step="10"
>
  <div data-xh-part="root">
    <label data-xh-part="label">数量（0 – 20，每档 2）</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger">−</button>
      <input data-xh-part="input" />
      <button data-xh-part="increment-trigger">+</button>
    </div>
    <span>
      数值：<span id="number-field-range-value">10</span> ·
      可加：<span id="number-field-range-increment">是</span> ·
      可减：<span id="number-field-range-decrement">是</span>
    </span>
  </div>
</xh-number-field>

<script type="module">
  // 数值从事件明细里取；可加可减写在两个按钮的 data-disabled 上，等这一轮接线落定再读
  const field = document.getElementById("number-field-range");
  const value = document.getElementById("number-field-range-value");
  const increment = document.getElementById("number-field-range-increment");
  const decrement = document.getElementById("number-field-range-decrement");
  const incrementTrigger = field.querySelector('[data-xh-part="increment-trigger"]');
  const decrementTrigger = field.querySelector('[data-xh-part="decrement-trigger"]');

  field.addEventListener("value-change", async (event) => {
    const asNumber = event.detail.valueAsNumber;
    value.textContent = Number.isNaN(asNumber) ? "（空）" : String(asNumber);
    await field.updateComplete;
    increment.textContent = incrementTrigger.hasAttribute("data-disabled") ? "否" : "是";
    decrement.textContent = decrementTrigger.hasAttribute("data-disabled") ? "否" : "是";
  });
<\/script>
`;export{e as default};
