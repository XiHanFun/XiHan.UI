const a=`<!-- 禁用与校验态 | disabled 与 readOnly 都改不动值，invalid 只把 aria-invalid 标出来、不拦输入 -->
<xh-text-field default-value="改不动" disabled>
  <div data-xh-part="root">
    <label data-xh-part="label">禁用</label>
    <input data-xh-part="input" style="inline-size: 160px" />
  </div>
</xh-text-field>

<xh-text-field default-value="只能看" read-only>
  <div data-xh-part="root">
    <label data-xh-part="label">只读</label>
    <input data-xh-part="input" style="inline-size: 160px" />
  </div>
</xh-text-field>

<xh-text-field default-value="格式不对" invalid>
  <div data-xh-part="root">
    <label data-xh-part="label">校验失败</label>
    <input data-xh-part="input" style="inline-size: 160px" />
  </div>
</xh-text-field>
`;export{a as default};
