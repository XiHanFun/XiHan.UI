const n=`<!-- 轨道内文案与滑块标记 | 轨道的子节点全由作者决定，data-state 同时打在轨道与滑块上 -->
<div style="display: flex; align-items: center; gap: 24px; flex-wrap: wrap">
  <!-- 文案与滑块同为轨道的直接子节点：开态文案在左、滑块在右，关态反过来 -->
  <xh-switch id="switch-track" default-checked>
    <button
      data-xh-part="root"
      style="
        inline-size: auto;
        min-inline-size: 64px;
        justify-content: space-between;
        gap: 6px;
        padding-inline: 8px;
      "
    >
      <span id="switch-track-on" style="font-size: 12px; color: var(--xh-fg-on-brand)">
        开
      </span>
      <span data-xh-part="thumb" style="translate: none"></span>
      <span id="switch-track-off" style="display: none; font-size: 12px">关</span>
    </button>
  </xh-switch>

  <!-- 滑块里也能放东西：属性由宿主打上，内容照写不误 -->
  <xh-switch id="switch-mark">
    <button data-xh-part="root">
      <span
        data-xh-part="thumb"
        style="display: inline-flex; align-items: center; justify-content: center; font-size: 11px"
      >
        <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6L18 18"/><path d="M18 6L6 18"/></svg>
      </span>
    </button>
  </xh-switch>
</div>

<script type="module">
  // 轨道里的两段文案按开合互斥显示
  const track = document.getElementById("switch-track");
  const on = document.getElementById("switch-track-on");
  const off = document.getElementById("switch-track-off");
  track.addEventListener("checked-change", (event) => {
    on.style.display = event.detail.checked ? "" : "none";
    off.style.display = event.detail.checked ? "none" : "";
  });

  // 滑块里的标记跟着开合换字
  const mark = document.getElementById("switch-mark");
  const thumb = mark.querySelector('[data-xh-part="thumb"]');
  mark.addEventListener("checked-change", (event) => {
    thumb.innerHTML = event.detail.checked
      ? '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg>'
      : '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6L18 18"/><path d="M18 6L6 18"/></svg>';
  });
<\/script>
`;export{n as default};
