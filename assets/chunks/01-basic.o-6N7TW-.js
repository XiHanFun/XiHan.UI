const n=`<!-- 基础用法 | 传的是图标记录本身而不是名字：名字要运行期查表，查表就得把整张表静态引进来，摇树全废 -->
<xh-icon id="icon-basic-check">
  <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
</xh-icon>

<xh-icon id="icon-basic-search">
  <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
</xh-icon>

<xh-icon id="icon-basic-star">
  <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
</xh-icon>

<!-- 记录里的 stroke 取 currentColor，配色随上下文的文字色流下来 -->
<span style="display: inline-flex; align-items: center; gap: 6px; color: #16a34a">
  <xh-icon id="icon-basic-check-inline">
    <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
  </xh-icon>
  已完成
</span>

<script type="module">
  // 图标记录是纯数据：坐标系、打在根 svg 上的呈现属性、图元树；是对象，只走 property
  const stroke = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const checkIcon = {
    name: "check",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [{ tag: "path", attrs: { d: "M4 12.5L9.5 18L20 6" } }],
  };

  const searchIcon = {
    name: "search",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      { tag: "circle", attrs: { cx: "10.5", cy: "10.5", r: "6.5" } },
      { tag: "path", attrs: { d: "M15.5 15.5L20.5 20.5" } },
    ],
  };

  const starIcon = {
    name: "star",
    viewBox: "0 0 24 24",
    attrs: stroke,
    nodes: [
      {
        tag: "path",
        attrs: {
          d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
        },
      },
    ],
  };

  document.getElementById("icon-basic-check").icon = checkIcon;
  document.getElementById("icon-basic-search").icon = searchIcon;
  document.getElementById("icon-basic-star").icon = starIcon;
  document.getElementById("icon-basic-check-inline").icon = checkIcon;
<\/script>
`;export{n as default};
