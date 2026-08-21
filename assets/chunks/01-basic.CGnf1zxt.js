const t=`<!-- 基础用法 | 按下态由 pressed 表达，非受控时组件自己维护 -->
<xh-toggle>
  <button data-xh-part="root">加粗</button>
</xh-toggle>

<xh-toggle id="toggle-basic-controlled" pressed="false">
  <button data-xh-part="root">受控：未按下</button>
</xh-toggle>

<script type="module">
  // 受控那颗由宿主写回按下态，按钮文字跟着换
  const toggle = document.getElementById("toggle-basic-controlled");
  const root = toggle.querySelector('[data-xh-part="root"]');
  toggle.addEventListener("pressed-change", (event) => {
    toggle.pressed = event.detail.pressed;
    root.textContent = \`受控：\${event.detail.pressed ? "已按下" : "未按下"}\`;
  });
<\/script>
`;export{t as default};
