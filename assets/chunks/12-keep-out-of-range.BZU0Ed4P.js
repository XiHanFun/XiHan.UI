var e=`<!-- 保留越界值 | 关掉 clampValueOnBlur 后越界输入不再在失焦时被悄悄改掉，outOfRange 报出来交给宿主提示 -->
<xh-number-field id="number-field-out-of-range" default-value="12" min="1" max="10" clamp-value-on-blur="false">
  <div data-xh-part="root">
    <label data-xh-part="label">每周训练天数</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="decrement-trigger"></button>
      <button data-xh-part="increment-trigger"></button>
    </div>
    <span id="number-field-out-of-range-hint">请填 1 到 10 之间的天数</span>
  </div>
</xh-number-field>

<script type="module">
  const field = document.getElementById("number-field-out-of-range");
  const hint = document.getElementById("number-field-out-of-range-hint");

  field.addEventListener("value-change", () => {
    hint.textContent = field.outOfRange ? "请填 1 到 10 之间的天数" : "范围 1 到 10";
  });
<\/script>
`;export{e as default};