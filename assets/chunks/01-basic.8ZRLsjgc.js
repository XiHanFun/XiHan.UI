const n=`<!-- 基础用法 | 一行放不下就收成省略号；有没有被裁如实报出来 -->
<div style="display: grid; gap: 12px; inline-size: 100%">
  <label style="display: flex; align-items: center; gap: 8px">
    容器宽度
    <input
      id="ellipsis-basic-width"
      type="range"
      min="120"
      max="640"
      step="20"
      value="240"
    />
    <span id="ellipsis-basic-width-text">240px</span>
  </label>

  <!-- 盒子越窄裁得越多。量测跟着容器尺寸走，拖动过程中结论一直是准的 -->
  <div id="ellipsis-basic-box" style="inline-size: 240px; max-inline-size: 100%">
    <!-- root 的内联 style 归组件写，作者自己的尺寸声明写在外层 -->
    <xh-ellipsis id="ellipsis-basic">
      <div data-xh-part="root">
        订单 2024-0731-8842 已由杭州仓发出，预计明日 18:00
        前送达，签收前请当面核对包装。
      </div>
    </xh-ellipsis>
  </div>

  <p style="margin: 0; color: var(--xh-fg-muted)">
    此刻 <span id="ellipsis-basic-state">整段都放得下</span>
  </p>
</div>

<script type="module">
  // 拖动滑杆改外层宽度，结论由 overflow-change 报回来
  const box = document.getElementById("ellipsis-basic-box");
  const slider = document.getElementById("ellipsis-basic-width");
  const widthText = document.getElementById("ellipsis-basic-width-text");
  const state = document.getElementById("ellipsis-basic-state");

  slider.addEventListener("input", () => {
    box.style.inlineSize = \`\${slider.value}px\`;
    widthText.textContent = \`\${slider.value}px\`;
  });

  document
    .getElementById("ellipsis-basic")
    .addEventListener("overflow-change", (event) => {
      state.textContent = event.detail.overflowing
        ? "被裁掉了一截"
        : "整段都放得下";
    });
<\/script>
`;export{n as default};
