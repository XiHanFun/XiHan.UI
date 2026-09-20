const a=`<!-- 形态 | ghost 贴在页面底色上，outline 为带描边的独立面，subtle 淡底 -->
<div style="display: grid; gap: 12px; inline-size: min(720px, 100%)">
  <xh-page-header variant="ghost">
    <div data-xh-part="root">
      <div data-xh-part="title">贴底</div>
      <div data-xh-part="description">融入页面背景</div>
    </div>
  </xh-page-header>

  <xh-page-header variant="outline">
    <div data-xh-part="root">
      <div data-xh-part="title">描边</div>
      <div data-xh-part="description">使用带描边的独立内容面</div>
    </div>
  </xh-page-header>

  <xh-page-header variant="subtle">
    <div data-xh-part="root">
      <div data-xh-part="title">淡底</div>
      <div data-xh-part="description">以淡底区分页头区域</div>
    </div>
  </xh-page-header>
</div>
`;export{a as default};
