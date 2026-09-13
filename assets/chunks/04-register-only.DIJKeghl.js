const t=`<!-- 组合式函数 | 不渲染组件实例 -->
<xh-hotkeys id="register-only-hotkey" keys="Mod,K"></xh-hotkeys>
<output id="register-only-output">按下 Mod + K · 等待输入</output>

<script type="module">
  let count = 0;
  document.querySelector("#register-only-hotkey").addEventListener("hot-key", () => {
    count += 1;
    document.querySelector("#register-only-output").textContent = \`按下 Mod + K · 已触发 \${count} 次\`;
  });
<\/script>
`;export{t as default};
