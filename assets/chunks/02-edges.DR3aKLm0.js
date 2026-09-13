const a=`<!-- 全部边缘 | 从任意边缘或角点调整尺寸 -->
<xh-resizable default-dimensions="240x120" min-width="120" min-height="80">
  <div data-xh-part="root" style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px">
    <span>从任意边缘调整</span>
    <span data-xh-part="handle" edge="n"></span><span data-xh-part="handle" edge="ne"></span>
    <span data-xh-part="handle" edge="e"></span><span data-xh-part="handle" edge="se"></span>
    <span data-xh-part="handle" edge="s"></span><span data-xh-part="handle" edge="sw"></span>
    <span data-xh-part="handle" edge="w"></span><span data-xh-part="handle" edge="nw"></span>
  </div>
</xh-resizable>
`;export{a as default};
