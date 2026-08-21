const a=`<!-- 图标当回退 | fallback 是普通插槽，放图标和放缩写字一样；没有名字可写时用图标表示「某位用户」 -->
<div id="avatar-icon" style="display: flex; align-items: center; gap: 12px">
  <xh-avatar size="sm">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">
        <xh-icon size="sm">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </span>
  </xh-avatar>

  <xh-avatar>
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">
        <xh-icon>
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </span>
  </xh-avatar>

  <xh-avatar size="lg">
    <span data-xh-part="root">
      <img data-xh-part="image" />
      <span data-xh-part="fallback">
        <xh-icon size="lg">
          <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
        </xh-icon>
      </span>
    </span>
  </xh-avatar>

  <span style="font-size: 13px">图元跟着档位一起换，取的是根流下来的前景色</span>
</div>

<script type="module">
  // 图标记录是对象，只能作为 property 交给三个 xh-icon
  const userIcon = {
    name: "user",
    viewBox: "0 0 24 24",
    attrs: {
      "fill": "none",
      "stroke": "currentColor",
      "stroke-width": "2",
      "stroke-linecap": "round",
      "stroke-linejoin": "round",
    },
    nodes: [
      { tag: "circle", attrs: { cx: "12", cy: "8", r: "3.5" } },
      { tag: "path", attrs: { d: "M5 20C5 16.5 8.1 14.5 12 14.5C15.9 14.5 19 16.5 19 20" } },
    ],
  };
  for (const icon of document.getElementById("avatar-icon").querySelectorAll("xh-icon")) {
    icon.icon = userIcon;
  }
<\/script>
`;export{a as default};
