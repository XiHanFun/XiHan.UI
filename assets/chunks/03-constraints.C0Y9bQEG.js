const n=`<!-- 约束 | 设置宽高比和步进 -->
<div style="display: grid; gap: 24px">
  <div>
    <p style="margin-bottom: 8px">16:9 宽高比</p>
    <xh-resizable id="rz-ratio" default-dimensions="240x135" edges="e,s,se" min-width="160">
      <div
        data-xh-part="root"
        style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
      >
        <span id="rz-ratio-out">240 × 135</span>
        <span data-xh-part="handle" edge="e"></span>
        <span data-xh-part="handle" edge="s"></span>
        <span data-xh-part="handle" edge="se"></span>
      </div>
    </xh-resizable>
  </div>

  <div>
    <p style="margin-bottom: 8px">40px 步进</p>
    <xh-resizable
      id="rz-step"
      default-dimensions="240x120"
      step="40"
      edges="e,s,se"
      min-width="120"
      min-height="80"
    >
      <div
        data-xh-part="root"
        style="border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); padding: 16px"
      >
        <span id="rz-step-out">240 × 120</span>
        <span data-xh-part="handle" edge="e"></span>
        <span data-xh-part="handle" edge="s"></span>
        <span data-xh-part="handle" edge="se"></span>
      </div>
    </xh-resizable>
  </div>
</div>

<script type="module">
  const ratio = document.getElementById("rz-ratio");
  const step = document.getElementById("rz-step");

  ratio.aspectRatio = 16 / 9;

  ratio.addEventListener("dimensions-change", (event) => {
    const { width, height } = event.detail.dimensions;
    document.getElementById("rz-ratio-out").textContent =
      \`\${Math.round(width)} × \${Math.round(height)}\`;
  });

  step.addEventListener("dimensions-change", (event) => {
    const { width, height } = event.detail.dimensions;
    document.getElementById("rz-step-out").textContent = \`\${width} × \${height}\`;
  });
<\/script>
`;export{n as default};
