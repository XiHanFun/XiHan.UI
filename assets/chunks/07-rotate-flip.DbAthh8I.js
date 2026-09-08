const n=`<!-- 旋转与翻转 | rotate 只收 90 / 180 / 270 三档，flip 沿横轴或纵轴取反；两者是独立属性，同写即叠加 -->
<span id="icon-rotate" style="display: inline-flex; align-items: center; gap: 10px">
  <xh-icon size="lg"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" rotate="90"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" rotate="180"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" rotate="270"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">不转 / 90 / 180 / 270</span>
</span>

<span id="icon-flip" style="display: inline-flex; align-items: center; gap: 10px">
  <xh-icon size="lg" flip="horizontal"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" flip="vertical"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" flip="both"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <xh-icon size="lg" rotate="90" flip="horizontal"><svg data-xh-part="root"><g data-xh-part="glyph"></g></svg></xh-icon>
  <span style="font-size: 13px">横轴 / 纵轴 / 两轴 / 转 90 再翻横轴</span>
</span>

<script type="module">
  // 图标记录是对象，只走 property
  const arrowIcon = {
    name: "arrow-right",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "path", attrs: { d: "M4 12h15" } },
      { tag: "path", attrs: { d: "M13 6l6 6-6 6" } },
    ],
  };

  for (const id of ["icon-rotate", "icon-flip"]) {
    for (const icon of document.getElementById(id).querySelectorAll("xh-icon")) {
      icon.icon = arrowIcon;
    }
  }
<\/script>
`;export{n as default};
