const n=`<!-- 尺寸与描边 | size 三档改直径、weight 三档改 stroke-width；缺省档不落 data-* 属性，皮肤的基础规则就是缺省档 -->
<span id="icon-size" style="display: inline-flex; align-items: center; gap: 10px">
  <xh-icon size="sm"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">sm / md（缺省）/ lg</span>
</span>

<span id="icon-weight" style="display: inline-flex; align-items: center; gap: 10px">
  <xh-icon size="lg" weight="light"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" weight="bold"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">light / regular（缺省）/ bold</span>
</span>

<script type="module">
  // 图标记录是对象，只走 property
  const starIcon = {
    name: "star",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      {
        tag: "path",
        attrs: {
          d: "M12 3.5L14.12 9.59L20.56 9.72L15.42 13.61L17.29 19.78L12 16.1L6.71 19.78L8.58 13.61L3.44 9.72L9.88 9.59Z",
        },
      },
    ],
  };

  for (const id of ["icon-size", "icon-weight"]) {
    for (const icon of document.getElementById(id).querySelectorAll("xh-icon")) {
      icon.icon = starIcon;
    }
  }
<\/script>
`;export{n as default};
