const n=`<!-- 图标与文字 | 图元放进 prefix 或 suffix 部件，文字放进 label；两个图元部件自带 aria-hidden，读屏念到的只有 label -->
<!-- 图元在前 -->
<xh-button variant="solid">
  <button data-xh-part="root">
    <span data-xh-part="prefix">
      <xh-icon id="button-icon-new" size="sm">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <span data-xh-part="label">新建</span>
  </button>
</xh-button>

<!-- 图元在后：换个部件就行，root 的 gap 两边通用 -->
<xh-button variant="outline">
  <button data-xh-part="root">
    <span data-xh-part="label">下一步</span>
    <span data-xh-part="suffix">
      <xh-icon id="button-icon-next" size="sm">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </button>
</xh-button>

<!-- 前后各一枚 -->
<xh-button variant="subtle" tone="success">
  <button data-xh-part="root">
    <span data-xh-part="prefix">
      <xh-icon id="button-icon-more-prefix" size="sm">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
    <span data-xh-part="label">再来一件</span>
    <span data-xh-part="suffix">
      <xh-icon id="button-icon-more-suffix" size="sm">
        <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
      </xh-icon>
    </span>
  </button>
</xh-button>

<script type="module">
  // 图元记录是对象，只走 property 交给 <xh-icon>，图元铺进空的 glyph
  const stroke = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const plus = {
    name: "plus",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "path", attrs: { d: "M12 5V19" } },
      { tag: "path", attrs: { d: "M5 12H19" } },
    ],
  };

  const arrowRight = {
    name: "arrow-right",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "path", attrs: { d: "M4 12H20" } },
      { tag: "path", attrs: { d: "M13 5L20 12L13 19" } },
    ],
  };

  document.getElementById("button-icon-new").icon = plus;
  document.getElementById("button-icon-next").icon = arrowRight;
  document.getElementById("button-icon-more-prefix").icon = plus;
  document.getElementById("button-icon-more-suffix").icon = arrowRight;
<\/script>
`;export{n as default};
