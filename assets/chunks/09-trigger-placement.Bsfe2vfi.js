const t=`<!-- 加减钮排布 | 触发器位置由作者写模板决定：放进 control 即减在左、加在右、输入框居中的一体式，不写 control 则照旧三件并排 -->
<xh-number-field default-value="1" min="0" max="9">
  <div data-xh-part="root">
    <label data-xh-part="label">一体式（control）</label>
    <div data-xh-part="control">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>

<xh-number-field default-value="1" min="0" max="9">
  <div data-xh-part="root">
    <label data-xh-part="label">三件并排（不写 control）</label>
    <div style="display: flex; gap: 4px">
      <button data-xh-part="decrement-trigger"></button>
      <input data-xh-part="input" style="inline-size: 80px; text-align: center" />
      <button data-xh-part="increment-trigger"></button>
    </div>
  </div>
</xh-number-field>
`;export{t as default};
