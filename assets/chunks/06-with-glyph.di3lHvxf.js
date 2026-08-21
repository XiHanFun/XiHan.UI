const n=`<!-- 带图元的标签 | 根是 inline-flex 且自带间距，图标或头像直接写进内容里跟文字并排 -->
<!-- 图标取 currentColor，颜色跟着标签的语气走 -->
<xh-badge variant="subtle" tone="success">
  <span data-xh-part="root">
    <xh-icon id="badge-glyph-passed" size="sm">
      <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
    已通过
  </span>
</xh-badge>

<xh-badge variant="outline" tone="info" size="lg">
  <span data-xh-part="root">
    <xh-icon id="badge-glyph-checked" size="sm">
      <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
    校验完成
  </span>
</xh-badge>

<!-- 头像缩到跟文字一档：直径与字号各是一个组件令牌 -->
<xh-badge variant="outline" size="lg">
  <span data-xh-part="root">
    <xh-avatar src="/images/logo.png" alt="曦寒">
      <span
        data-xh-part="root"
        style="--xh-avatar-size: 18px; --xh-avatar-font-size: 10px"
      >
        <img data-xh-part="image" />
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    曦寒
  </span>
</xh-badge>

<script type="module">
  // 图标记录是对象，只走 property
  const check = {
    name: "check",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6" } }],
  };
  document.getElementById("badge-glyph-passed").icon = check;
  document.getElementById("badge-glyph-checked").icon = check;
<\/script>
`;export{n as default};
