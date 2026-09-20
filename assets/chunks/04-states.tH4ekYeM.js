const t=`<!-- 禁用与校验态 | disabled 连明暗切换一起停止，read-only 只锁定值、明暗照常切换，invalid 只标注不拦截输入 -->
<xh-password-input default-value="hunter2" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input default-value="hunter2" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">只读</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<xh-password-input default-value="123" invalid>
  <div data-xh-part="root">
    <label data-xh-part="label">校验失败</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 160px" />
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>
`;export{t as default};
