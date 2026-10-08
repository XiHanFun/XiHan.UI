var e=`<!-- 最近使用色 | 一轮取色结束（浮层收起，或常驻形态下焦点离开取色面）且颜色变了，就记进最近使用色，最新的在最前、同色只留一份；受控写回由宿主保存，刷新后还在 -->
<xh-color-picker id="color-picker-recent" default-value="#3b82f6" recent-colors="#ef4444,#f59e0b" max-recent-colors="6">
  <div data-xh-part="root">
    <label data-xh-part="label">标记颜色</label>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span data-xh-part="value-text"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="saturation-area">
          <div data-xh-part="area-thumb"></div>
        </div>
        <div data-xh-part="hue-slider">
          <div data-xh-part="control">
            <div data-xh-part="track"></div>
            <div data-xh-part="thumb"></div>
          </div>
        </div>
        <div data-xh-part="recent-swatch-picker"></div>
        <xh-button id="color-picker-recent-clear" size="sm" variant="ghost">
          <button data-xh-part="root">清空最近使用</button>
        </xh-button>
      </div>
    </div>
  </div>
</xh-color-picker>

<script type="module">
  const picker = document.getElementById("color-picker-recent");
  const mount = picker.querySelector('[data-xh-part="recent-swatch-picker"]');
  const clear = document.getElementById("color-picker-recent-clear");

  // 格子由作者按当前列表铺：每格是 color-swatch-picker 的 item，色块面、选中标记与表单影子手写
  function render(colors) {
    mount.replaceChildren(
      ...colors.map((value) => {
        const item = document.createElement("div");
        item.dataset.xhPart = "item";
        item.setAttribute("value", value);
        item.innerHTML =
          '<input data-xh-part="hidden-input" />' +
          '<span data-xh-part="swatch"></span>' +
          '<span data-xh-part="indicator"></span>';
        return item;
      })
    );
    clear.hidden = colors.length === 0;
  }

  // 受控：宿主收下新列表再写回（真实场景顺手存进本地存储）
  picker.addEventListener("recent-colors-change", (event) => {
    picker.recentColors = event.detail.recentColors;
    render(event.detail.recentColors);
  });
  clear.addEventListener("click", () => picker.clearRecentColors());

  render(["#ef4444", "#f59e0b"]);
<\/script>
`;export{e as default};