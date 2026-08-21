const a=`<!-- 禁用与校验失败 | disabled 让每格都带原生 disabled 且不参与提交，invalid 只做标注、照样能改 -->
<xh-pin-input length="4" default-value="1234" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>

<xh-pin-input length="4" default-value="1234" invalid>
  <div data-xh-part="root">
    <label data-xh-part="label">校验失败</label>
    <div style="display: flex">
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
      <input data-xh-part="input" />
    </div>
  </div>
</xh-pin-input>
`;export{a as default};
