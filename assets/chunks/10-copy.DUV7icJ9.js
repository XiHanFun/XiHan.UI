const t=`<!-- 复制全部 | 日志旁放一颗剪贴板按钮复制整段输出；带 ANSI 转义的原文先用 stripAnsi 去掉转义，复制出去的是纯文字 -->
<div style="display: grid; gap: 8px; inline-size: 100%">
  <xh-clipboard id="log-copy-clipboard">
    <div data-xh-part="root">
      <button data-xh-part="copy-trigger">
        <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2.5" width="8" height="4" rx="1"/><path d="M16 4.5h1.5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H8"/></svg> 复制全部</span>
        <span data-xh-part="indicator" copied><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg> 已复制</span>
      </button>
    </div>
  </xh-clipboard>
  <xh-log rows="4">
    <div data-xh-part="root">
      <div data-xh-part="viewport">
        <div data-xh-part="content" id="log-copy-content"></div>
      </div>
    </div>
  </xh-log>
</div>

<script type="module">
  const ESC = "\\u001B";
  const lines = [
    \`\${ESC}[2m$ pnpm test\${ESC}[0m\`,
    \`\${ESC}[32m✓\${ESC}[0m tests/order.spec.ts (12 tests)\`,
    \`\${ESC}[31m✗\${ESC}[0m tests/payment.spec.ts > 超时重试 \${ESC}[1;31mFAILED\${ESC}[0m\`,
    \`Tests  \${ESC}[1;31m1 failed\${ESC}[0m | \${ESC}[32m12 passed\${ESC}[0m (13)\`,
  ];
  const content = document.getElementById("log-copy-content");
  for (const text of lines) {
    const line = document.createElement("div");
    line.setAttribute("data-xh-part", "line");
    line.setAttribute("ansi", "");
    line.textContent = text;
    content.append(line);
  }
  // 复制出去的是去掉转义之后的纯文字；这里只有颜色转义，按 SGR 的写法去掉即可
  const sgr = new RegExp(\`\${ESC}\\\\[[0-9;]*m\`, "g");
  document.getElementById("log-copy-clipboard").setAttribute("value", lines.map(text => text.replace(sgr, "")).join("\\n"));
<\/script>
`;export{t as default};
