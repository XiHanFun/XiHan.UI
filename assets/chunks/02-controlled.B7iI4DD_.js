const t=`<!-- 受控 | 传了 checked 就由宿主说了算，组件自己不再改状态；变化意图从 checked-change 出来，写回才落位 -->
<xh-switch id="switch-controlled" checked>
  <button data-xh-part="root">
    <span data-xh-part="thumb"></span>
  </button>
</xh-switch>
<span id="switch-controlled-text">当前：开</span>

<script type="module">
  // 意图写回 checked，开关才动
  const host = document.getElementById("switch-controlled");
  const text = document.getElementById("switch-controlled-text");
  host.addEventListener("checked-change", (event) => {
    host.checked = event.detail.checked;
    text.textContent = \`当前：\${event.detail.checked ? "开" : "关"}\`;
  });
<\/script>
`;export{t as default};
