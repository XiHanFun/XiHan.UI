const a=`<!-- 全部边缘 | 从任意边缘或角点调整尺寸 -->
<xh-resizable default-dimensions="240x120" min-width="120" min-height="80" aria-label="支持全部边缘的占位区块">
  <div data-xh-part="root" style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px">
    <span data-demo-block data-tone="info" style="--xh-demo-block-block-size: 100%; --xh-demo-block-min-block-size: 100%"></span>
    <span data-xh-part="handle" edge="n"></span><span data-xh-part="handle" edge="ne"></span>
    <span data-xh-part="handle" edge="e"></span><span data-xh-part="handle" edge="se"></span>
    <span data-xh-part="handle" edge="s"></span><span data-xh-part="handle" edge="sw"></span>
    <span data-xh-part="handle" edge="w"></span><span data-xh-part="handle" edge="nw"></span>
  </div>
</xh-resizable>
`;export{a as default};
