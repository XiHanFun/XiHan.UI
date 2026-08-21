const t=`<!-- 形态 | variant 只改皮肤怎么用颜色，加减与键盘行为三档完全一致 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-number-field variant="outline" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">outline</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger">−</button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger">+</button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="subtle" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">subtle</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger">−</button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger">+</button>
      </div>
    </div>
  </xh-number-field>

  <xh-number-field variant="ghost" default-value="1">
    <div data-xh-part="root">
      <label data-xh-part="label">ghost</label>
      <div data-xh-part="control">
        <button data-xh-part="decrement-trigger">−</button>
        <input data-xh-part="input" />
        <button data-xh-part="increment-trigger">+</button>
      </div>
    </div>
  </xh-number-field>
</div>
`;export{t as default};
