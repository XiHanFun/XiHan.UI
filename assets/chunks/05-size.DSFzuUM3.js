const a=`<!-- 尺寸 | 适配不同的信息密度 -->
<div style="display: grid; gap: 16px; inline-size: min(560px, 100%)">
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="inline-size: 24px; color: var(--xh-fg-muted)">小</span>
    <xh-breadcrumb size="sm">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" href="#/components">组件</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="inline-size: 24px; color: var(--xh-fg-muted)">中</span>
    <xh-breadcrumb>
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" href="#/components">组件</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
  <div style="display: flex; align-items: center; gap: 16px">
    <span style="inline-size: 24px; color: var(--xh-fg-muted)">大</span>
    <xh-breadcrumb size="lg">
      <nav data-xh-part="root">
        <ol data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" href="#/">首页</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" href="#/components">组件</a></li>
          <li data-xh-part="separator"></li>
          <li data-xh-part="item"><a data-xh-part="link" current>面包屑</a></li>
        </ol>
      </nav>
    </xh-breadcrumb>
  </div>
</div>
`;export{a as default};
