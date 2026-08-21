const a=`<!-- 尺寸 | size 换的是各段的内边距与标题字号，不写 size 即默认档 -->
<div style="display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px">
  <xh-card variant="outline" size="sm">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">小</div>
      </div>
      <div data-xh-part="body">正文。</div>
    </div>
  </xh-card>

  <!-- 中间一档不写 size -->
  <xh-card variant="outline">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">默认</div>
      </div>
      <div data-xh-part="body">正文。</div>
    </div>
  </xh-card>

  <xh-card variant="outline" size="lg">
    <div data-xh-part="root" style="inline-size: 200px">
      <div data-xh-part="header">
        <div data-xh-part="title">大</div>
      </div>
      <div data-xh-part="body">正文。</div>
    </div>
  </xh-card>
</div>
`;export{a as default};
