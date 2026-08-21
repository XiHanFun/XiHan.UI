const n=`<!-- 校验态 | invalid 由宿主自己判定，不必挂在表单上；标出来之后值照样能改、加减钮照样能按 -->
<xh-number-field id="number-field-invalid" default-value="8" min="1" max="99" invalid>
  <div data-xh-part="root">
    <label data-xh-part="label">购买数量</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger">−</button>
      <button data-xh-part="increment-trigger">+</button>
    </div>
    <span id="number-field-invalid-hint">库存只有 5 件</span>
  </div>
</xh-number-field>

<script type="module">
  // 超出库存就标成校验失败，判定与提示都在这里做
  const stock = 5;
  const field = document.getElementById("number-field-invalid");
  const hint = document.getElementById("number-field-invalid-hint");

  field.addEventListener("value-change", (event) => {
    const over = event.detail.valueAsNumber > stock;
    field.invalid = over;
    hint.textContent = over ? \`库存只有 \${stock} 件\` : "库存充足";
  });
<\/script>
`;export{n as default};
