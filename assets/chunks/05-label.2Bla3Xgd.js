var e=`<!-- 可及名字 | 默认使用 value 作为 aria-label；内容不适合朗读时用 label 替换为可读文案 -->
<div style="display: grid; gap: 12px; justify-items: start">
  <xh-text-field id="matrix-code-label-input" default-value="https://ui.xihanfun.com">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <input data-xh-part="input" aria-label="要编码的内容" />
      </div>
    </div>
  </xh-text-field>
  <!-- 内容清空时不画码，读屏也读不到这块 -->
  <xh-matrix-code
    id="matrix-code-label"
    value="https://ui.xihanfun.com"
    pixel-size="140"
    label="曦寒 UI 文档站二维码"
  >
    <svg data-xh-part="root"></svg>
  </xh-matrix-code>
</div>

<script type="module">
  // 文本框里敲什么就编码什么
  const field = document.getElementById("matrix-code-label-input");
  const code = document.getElementById("matrix-code-label");
  field.addEventListener("value-change", (event) => {
    code.value = event.detail.value;
  });
<\/script>
`;export{e as default};