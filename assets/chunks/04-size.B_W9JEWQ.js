const a=`<!-- 尺寸 | 适配不同的界面密度 -->
<div style="display: flex; align-items: center; gap: 16px">
  <xh-checkbox size="sm" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">小</span>
    </label>
  </xh-checkbox>
  <xh-checkbox default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">中</span>
    </label>
  </xh-checkbox>
  <xh-checkbox size="lg" default-checked>
    <label data-xh-part="label">
      <button data-xh-part="root"><span data-xh-part="indicator"></span></button>
      <span data-xh-part="text">大</span>
    </label>
  </xh-checkbox>
</div>
`;export{a as default};
