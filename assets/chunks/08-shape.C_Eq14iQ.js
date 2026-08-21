const n=`<!-- 形状与图标按钮 | 圆角是一个组件令牌；只放一枚图元时把左右内边距收成 0、宽度取控件档位，名字这时只能由 aria-label 给 -->
<xh-button variant="solid">
  <button data-xh-part="root">直角</button>
</xh-button>

<!-- 胶囊：只改圆角这一个槽位 -->
<xh-button variant="solid">
  <button data-xh-part="root" style="--xh-button-radius: var(--xh-shape-pill)">
    胶囊
  </button>
</xh-button>

<!-- 方形图标按钮 -->
<xh-button variant="outline" icon-only>
  <button data-xh-part="root" aria-label="搜索">
    <xh-icon id="button-shape-square" size="sm">
      <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
  </button>
</xh-button>

<!-- 圆形图标按钮：方形再叠上胶囊圆角 -->
<xh-button variant="solid" icon-only>
  <button
    data-xh-part="root"
    aria-label="搜索"
    style="--xh-button-radius: var(--xh-shape-pill)"
  >
    <xh-icon id="button-shape-round" size="sm">
      <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
    </xh-icon>
  </button>
</xh-button>

<script type="module">
  // 图元记录是对象，只走 property 交给 <xh-icon>
  const search = {
    name: "search",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "circle", attrs: { cx: "10.5", cy: "10.5", r: "6.5" } },
      { tag: "path", attrs: { d: "M15.5 15.5L20.5 20.5" } },
    ],
  };

  document.getElementById("button-shape-square").icon = search;
  document.getElementById("button-shape-round").icon = search;
<\/script>
`;export{n as default};
