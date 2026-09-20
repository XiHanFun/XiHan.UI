const a=`<!-- 手写格子 | 不提供数据也可以：每格自行声明 value，名字与禁用写在格子上；半透明颜色铺在棋盘格上 -->
<!-- 受控值是 rgb 写法，与 #e11d48 那一格按颜色对上；禁用用 aria-disabled 声明 -->
<div style="display: flex; flex-direction: column; gap: 8px">
  <xh-color-swatch-picker id="swatch-picker-items" value="rgb(225, 29, 72)">
    <div data-xh-part="root">
      <span data-xh-part="label">高亮色</span>
      <div data-xh-part="item" value="#e11d48" label="玫红">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#e11d4880" label="半透明玫红">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#f59e0b" label="琥珀" aria-disabled="true">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="hsl(217 91% 60%)" label="天蓝">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
    </div>
  </xh-color-swatch-picker>
  <span style="font-size: 13px">当前：<code id="swatch-picker-items-value">rgb(225, 29, 72)</code></span>
</div>

<script type="module">
  // 受控：选中值由宿主写回元素
  const picker = document.getElementById("swatch-picker-items");
  const readout = document.getElementById("swatch-picker-items-value");
  picker.addEventListener("value-change", (event) => {
    picker.value = event.detail.value;
    readout.textContent = event.detail.value ?? "（未选）";
  });
<\/script>
`;export{a as default};
