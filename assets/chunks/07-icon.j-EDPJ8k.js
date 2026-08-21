const t=`<!-- 条目里的图标与快捷键 | item-text 只是文字那一段，图标与快捷键提示作为兄弟节点排在它两侧 -->
<div style="inline-size: 100%; display: grid; gap: 12px">
  <xh-context-menu id="context-menu-icon">
    <div data-xh-part="root">
      <div data-xh-part="trigger" style="display: grid; place-items: center; min-block-size: 120px">
        <span>右键看带图标与快捷键的条目</span>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="cut">
            <xh-icon size="sm" data-glyph="cut">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">剪切</span>
            <!-- item-text 会撑满剩余宽度，快捷键提示自然被顶到条目末端 -->
            <span style="color: var(--xh-fg-muted)">Ctrl+X</span>
          </div>
          <div data-xh-part="item" value="paste" aria-disabled="true">
            <xh-icon size="sm" data-glyph="paste">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">粘贴</span>
            <span style="color: var(--xh-fg-muted)">Ctrl+V</span>
          </div>
          <div data-xh-part="separator"></div>
          <div data-xh-part="item" value="delete">
            <xh-icon size="sm" data-glyph="trash">
              <svg data-xh-part="root"><g data-xh-part="glyph"></g></svg>
            </xh-icon>
            <span data-xh-part="item-text">删除</span>
            <span style="color: var(--xh-fg-muted)">Del</span>
          </div>
        </div>
      </div>
    </div>
  </xh-context-menu>
</div>

<script type="module">
  // 描边取 currentColor，图标颜色随条目文字色走，禁用态也一并跟着变淡
  const strokeAttrs = {
    "fill": "none",
    "stroke": "currentColor",
    "stroke-width": "2",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  };

  const icons = {
    cut: {
      name: "cut",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "circle", attrs: { cx: "6", cy: "18", r: "3" } },
        { tag: "circle", attrs: { cx: "18", cy: "18", r: "3" } },
        { tag: "path", attrs: { d: "M8 16L18 4M16 16L6 4" } },
      ],
    },
    paste: {
      name: "paste",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "rect", attrs: { x: "5", y: "4", width: "14", height: "17", rx: "2" } },
        { tag: "path", attrs: { d: "M9 4V3H15V4" } },
      ],
    },
    trash: {
      name: "trash",
      viewBox: "0 0 24 24",
      attrs: strokeAttrs,
      nodes: [
        { tag: "path", attrs: { d: "M4 7H20" } },
        { tag: "path", attrs: { d: "M10 11V17M14 11V17" } },
        { tag: "path", attrs: { d: "M6 7L7 20H17L18 7" } },
      ],
    },
  };

  // 图标记录是对象，只能作为 property 交给每个 xh-icon
  for (const el of document.getElementById("context-menu-icon").querySelectorAll("xh-icon")) {
    el.icon = icons[el.dataset.glyph];
  }
<\/script>
`;export{t as default};
