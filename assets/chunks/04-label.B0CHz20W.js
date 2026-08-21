const n=`<!-- 可及名字 | 缺省拿 value 当 aria-label；内容不是给人念的时候用 label 换一句人话 -->
<div style="display: grid; gap: 12px; justify-items: start">
  <input
    id="qr-code-label-input"
    type="text"
    value="https://ui.xihanfun.com"
    aria-label="要编码的内容"
    style="inline-size: 320px; max-inline-size: 100%"
  />
  <!-- 内容清空时不画码，读屏也读不到这块 -->
  <xh-qr-code
    id="qr-code-label"
    value="https://ui.xihanfun.com"
    pixel-size="140"
    label="曦寒 UI 文档站二维码"
  >
    <svg data-xh-part="root"></svg>
  </xh-qr-code>
</div>

<script type="module">
  // 输入框里敲什么就编码什么
  const input = document.getElementById("qr-code-label-input");
  const code = document.getElementById("qr-code-label");
  input.addEventListener("input", () => {
    code.value = input.value;
  });
<\/script>
`;export{n as default};
