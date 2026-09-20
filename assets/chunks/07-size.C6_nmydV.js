const t=`<!-- 尺寸 | size 只改变高度、内边距与字号，标签、切换按钮与大写锁定提示一起换档；不写即默认档 -->
<xh-password-input size="sm" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">sm</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">缺省</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input size="lg" default-value="hunter2">
  <div data-xh-part="root">
    <label data-xh-part="label">lg</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>
`;export{t as default};
