const n=`<!-- 换掉转圈图形 | 内置圆环画在伪元素上，把直径与描边归零它就不占位；自绘的图形写进 root 里 -->
<!-- 自绘图形：转动复用皮肤里的 xh-spin 关键帧，图形本身随便画 -->
<xh-spinner label="正在同步仓库">
  <span
    data-xh-part="root"
    style="--xh-spinner-size: 0; --xh-spinner-thickness: 0; --xh-spinner-gap: 0"
  >
    <xh-icon
      id="spinner-graphic-arc"
      size="lg"
      style="
        display: inline-flex;
        --xh-icon-fg: var(--xh-bg-brand);
        animation: xh-spin 900ms linear infinite;
      "
    >
      <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
    <span data-xh-part="label" style="margin-inline-start: 8px">正在同步仓库</span>
  </span>
</xh-spinner>

<!-- 点阵：图形不必是一个整体，几个方块也能当指示器 -->
<xh-spinner label="正在生成摘要">
  <span
    data-xh-part="root"
    style="--xh-spinner-size: 0; --xh-spinner-thickness: 0; --xh-spinner-gap: 0"
  >
    <span id="spinner-graphic-dots" style="display: inline-flex; gap: 4px"></span>
    <span data-xh-part="label" style="margin-inline-start: 8px">正在生成摘要</span>
  </span>
</xh-spinner>

<script type="module">
  // 图标记录是对象，只走 property
  document.getElementById("spinner-graphic-arc").icon = {
    name: "arc",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2.5",
      "stroke-linecap": "round",
    },
    nodes: [
      { tag: "path", attrs: { d: "M12 3A9 9 0 1 1 5.64 5.64" } },
      { tag: "path", attrs: { d: "M12 8.5A3.5 3.5 0 0 1 15.5 12" } },
    ],
  };

  // 三个点错开相位地明灭：延迟各差一档，看起来就是一串跑动的点
  const dots = document.getElementById("spinner-graphic-dots");
  dots.replaceChildren(
    ...[0, 160, 320].map((delay) => {
      const dot = document.createElement("span");
      dot.style.cssText = [
        "inline-size: 6px",
        "block-size: 6px",
        "border-radius: var(--xh-radius-full)",
        "background: var(--xh-bg-brand)",
        \`animation: xh-fade-in 600ms var(--xh-ease-standard) \${delay}ms infinite alternate\`,
      ].join("; ");
      return dot;
    }),
  );
<\/script>
`;export{n as default};
