const d=`<!-- 顺序排列 | 按文档顺序逐列填充 -->
<style>
  #masonry-sequential [data-card] { padding: 18px 14px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
  #masonry-sequential [data-card] div { margin-block-start: 6px; }
</style>
<xh-masonry id="masonry-sequential" columns="3" gap="sm" sequential style="display: contents">
  <div data-xh-part="root" style="inline-size: min(640px, 100%)">
    <div data-xh-part="column"></div><div data-xh-part="column"></div><div data-xh-part="column"></div>
    <div data-xh-part="item"><div data-card><strong>1</strong><div>创建项目</div></div></div>
    <div data-xh-part="item"><div data-card><strong>2</strong><div>配置主题</div></div></div>
    <div data-xh-part="item"><div data-card><strong>3</strong><div>添加组件</div></div></div>
    <div data-xh-part="item"><div data-card><strong>4</strong><div>连接数据</div></div></div>
    <div data-xh-part="item"><div data-card><strong>5</strong><div>运行测试</div></div></div>
    <div data-xh-part="item"><div data-card><strong>6</strong><div>发布应用</div></div></div>
  </div>
</xh-masonry>
`;export{d as default};
