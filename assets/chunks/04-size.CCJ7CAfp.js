const d=`<!-- 尺寸 | size 换的是标题字号与整块的上下留白，不写 size 即默认档 -->
<div style="display: flex; flex-direction: column">
  <xh-page-header size="sm" bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">小档标题</div>
      <div data-xh-part="subtitle">副标题跟着标题排在同一行</div>
    </div>
  </xh-page-header>

  <!-- 中间一档不写 size -->
  <xh-page-header bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">默认档标题</div>
      <div data-xh-part="subtitle">副标题跟着标题排在同一行</div>
    </div>
  </xh-page-header>

  <xh-page-header size="lg" bordered>
    <div data-xh-part="root">
      <div data-xh-part="title">大档标题</div>
      <div data-xh-part="subtitle">副标题跟着标题排在同一行</div>
    </div>
  </xh-page-header>
</div>
`;export{d as default};
