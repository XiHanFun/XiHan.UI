const d=`<!-- 基础用法 | 创建纵向滚动区域 -->
<xh-scroll-area type="always" style="display: contents">
  <div data-xh-part="root" style="block-size: 180px; inline-size: min(360px, 100%); border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle)">
    <div data-xh-part="viewport">
      <div data-xh-part="content" style="padding: 12px 16px">
        <div style="padding-block: 7px">项目概览</div><div style="padding-block: 7px">组件规范</div>
        <div style="padding-block: 7px">设计令牌</div><div style="padding-block: 7px">无障碍</div>
        <div style="padding-block: 7px">交互状态</div><div style="padding-block: 7px">主题配置</div>
        <div style="padding-block: 7px">构建流程</div><div style="padding-block: 7px">发布记录</div>
        <div style="padding-block: 7px">迁移指南</div><div style="padding-block: 7px">常见问题</div>
      </div>
    </div>
    <div data-xh-part="scrollbar" orientation="vertical"><div data-xh-part="track"><div data-xh-part="thumb"></div></div></div>
  </div>
</xh-scroll-area>
`;export{d as default};
