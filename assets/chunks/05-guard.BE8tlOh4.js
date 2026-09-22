const a=`<!-- 禁用标签 | 保留暂不可用的内容入口 -->
<xh-tabs default-value="active">
  <div data-xh-part="root" style="inline-size: 360px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="标签状态">
      <button data-xh-part="trigger" value="active">当前</button>
      <button data-xh-part="trigger" value="disabled" disabled>不可用</button>
      <button data-xh-part="trigger" value="available">可用</button>
      <div data-xh-part="indicator"></div>
    </div>

    <div data-xh-part="content" value="active">当前标签可以正常切换。</div>
    <div data-xh-part="content" value="disabled">此内容暂不可用。</div>
    <div data-xh-part="content" value="available">此标签可以选择。</div>
  </div>
</xh-tabs>
`;export{a as default};
