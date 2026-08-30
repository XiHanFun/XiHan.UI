const n=`<!-- 基础用法 | 八条边各一个把手；拖动改尺寸，Tab 到把手用方向键也能推 -->
<!-- 留出余量：把手压在边上，往外挪了半个身位 -->
<div style="padding: 12px">
  <xh-resizable id="rz" default-size="260x140" min-width="120" min-height="80" max-width="480">
    <div
      data-xh-part="root"
      style="border: 1px solid var(--xh-border-default); border-radius: var(--xh-shape-surface); padding: 12px"
    >
      <span>拖任意一条边或一个角</span>
      <span data-xh-part="handle" edge="n"></span>
      <span data-xh-part="handle" edge="ne"></span>
      <span data-xh-part="handle" edge="e"></span>
      <span data-xh-part="handle" edge="se"></span>
      <span data-xh-part="handle" edge="s"></span>
      <span data-xh-part="handle" edge="sw"></span>
      <span data-xh-part="handle" edge="w"></span>
      <span data-xh-part="handle" edge="nw"></span>
    </div>
  </xh-resizable>
</div>
<p id="rz-out" style="margin-top: 12px; color: var(--xh-fg-muted)">260 × 140</p>

<script type="module">
  const el = document.getElementById("rz");
  const out = document.getElementById("rz-out");
  el.addEventListener("size-change", (event) => {
    const { width, height } = event.detail.size;
    out.textContent = \`\${Math.round(width)} × \${Math.round(height)}\`;
  });
<\/script>
`;export{n as default};
