const n=`<!-- 横幅 | banner 把提示贴在页面顶部铺满整行：不取圆角，只在朝向页面内容的块尾画一道描边；关闭后下方内容平移上来 -->
<div
  style="
    width: 100%;
    overflow: hidden;
    border: 1px solid var(--xh-border-default);
    border-radius: var(--xh-shape-surface);
  "
>
  <xh-alert banner tone="warning">
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div data-xh-part="title">系统将于今晚 23:00 维护</div>
        <div data-xh-part="description">维护约 30 分钟，期间无法提交表单</div>
      </div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </xh-alert>
  <p style="margin: 0; padding: var(--xh-space-4); color: var(--xh-fg-muted)">页面内容</p>
</div>
`;export{n as default};
