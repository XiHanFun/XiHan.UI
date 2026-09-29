const n=`<!-- ANSI 着色 | 行上写 ansi 交出带转义的原文，按 SGR 拆成着色的段：颜色映射到语义色，粗体、暗淡、下划线各自生效，其余转义不显示 -->
<xh-log rows="6" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <div data-xh-part="content" id="log-ansi-content"></div>
    </div>
  </div>
</xh-log>

<script type="module">
  // 带 ansi 属性的行，文字就是带转义的原文，元素按 SGR 拆成着色的 segment
  const ESC = "\\u001B";
  const lines = [
    \`\${ESC}[2m$ pnpm build\${ESC}[0m\`,
    \`\${ESC}[36mvite\${ESC}[0m v7.1.2 \${ESC}[32mbuilding for production...\${ESC}[0m\`,
    \`\${ESC}[32m✓\${ESC}[0m 1,204 modules transformed.\`,
    \`\${ESC}[33m(!) Some chunks are larger than 500 kB after minification.\${ESC}[0m\`,
    \`\${ESC}[1;31merror\${ESC}[0m src/app.ts(12,3): \${ESC}[4mType 'string' is not assignable to type 'number'.\${ESC}[0m\`,
    \`\${ESC}[1;32m✓ built in 4.21s\${ESC}[0m\`,
  ];
  const content = document.getElementById("log-ansi-content");
  for (const text of lines) {
    const line = document.createElement("div");
    line.setAttribute("data-xh-part", "line");
    line.setAttribute("ansi", "");
    line.textContent = text;
    content.append(line);
  }
<\/script>
`;export{n as default};
