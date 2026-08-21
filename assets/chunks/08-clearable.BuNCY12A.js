const n=`<!-- 空态与面板按钮 | 受控时「没有颜色」由宿主表达：值置空，触发器换成占位方框；面板底下的两个按钮是作者自己的，收起浮层同样归宿主 -->
<div style="display: grid; gap: 12px">
  <xh-color-picker id="color-picker-clearable" value="#3b82f6" open="false">
    <div data-xh-part="root">
      <label data-xh-part="label">主题色</label>
      <button data-xh-part="trigger">
        <span data-xh-part="swatch"></span>
        <span
          id="color-picker-clearable-blank"
          style="
            display: none;
            flex: none;
            align-items: center;
            justify-content: center;
            inline-size: 1.125rem;
            block-size: 1.125rem;
            border: 1px dashed var(--xh-border-strong);
            border-radius: var(--xh-radius-sm);
            font-size: 10px;
            color: var(--xh-fg-muted);
          "
          >∅</span
        >
        <span data-xh-part="value-text">#3b82f6</span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="area">
            <div data-xh-part="area-thumb"></div>
          </div>
          <div data-xh-part="channel-slider" channel="hue">
            <div data-xh-part="channel-slider-track"></div>
            <div data-xh-part="channel-slider-thumb"></div>
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 8px">
            <xh-button size="sm" variant="ghost">
              <button data-xh-part="root" id="color-picker-clearable-clear">
                清空
              </button>
            </xh-button>
            <xh-button size="sm">
              <button data-xh-part="root" id="color-picker-clearable-ok">
                确定
              </button>
            </xh-button>
          </div>
        </div>
      </div>
    </div>
  </xh-color-picker>

  <span>当前：<span id="color-picker-clearable-readout">#3b82f6</span></span>
</div>

<script type="module">
  // 值与开合都由宿主握着：变更经事件回来，写回去才生效
  const picker = document.getElementById("color-picker-clearable");
  const swatch = picker.querySelector('[data-xh-part="swatch"]');
  const blank = document.getElementById("color-picker-clearable-blank");
  const text = picker.querySelector('[data-xh-part="value-text"]');
  const readout = document.getElementById("color-picker-clearable-readout");

  function paint(color) {
    swatch.style.display = color ? "" : "none";
    blank.style.display = color ? "none" : "inline-flex";
    text.textContent = color || "未设置";
    readout.textContent = color || "未设置";
  }

  picker.addEventListener("value-change", (event) => {
    picker.value = event.detail.value;
    paint(event.detail.value);
  });

  picker.addEventListener("open-change", (event) => {
    picker.open = event.detail.open;
  });

  document
    .getElementById("color-picker-clearable-clear")
    .addEventListener("click", () => {
      picker.value = "";
      picker.open = false;
      paint("");
    });

  document
    .getElementById("color-picker-clearable-ok")
    .addEventListener("click", () => {
      picker.open = false;
    });
<\/script>
`;export{n as default};
