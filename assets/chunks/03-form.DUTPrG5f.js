const t=`<!-- 参与表单 | 给了 name 就带上表单影子，提交的是一份独立 SVG；表单重置会把画布清回空 -->
<form id="xh-signature-form" style="display: flex; flex-direction: column; gap: 12px; max-inline-size: 22rem">
  <xh-signature-pad id="xh-signature-form-pad" name="signature" required>
    <div data-xh-part="root">
      <span data-xh-part="label">验收签名（必填）</span>
      <svg data-xh-part="control">
        <line data-xh-part="guide"></line>
        <path data-xh-part="segment"></path>
      </svg>
      <button data-xh-part="clear-trigger">清空</button>
      <!-- 画布是一张图，签没签只能从这块活区域听出来；签上与清空都会播报一次 -->
      <span data-xh-part="status"></span>
      <!-- 表单影子视觉隐藏，但 required 会拦住空签名的提交 -->
      <input data-xh-part="hidden-input" />
    </div>
  </xh-signature-pad>
  <div style="display: flex; gap: 8px">
    <button type="submit">提交</button>
    <button type="reset">重置</button>
  </div>
</form>

<script type="module">
  // 演示页不真发请求，拦下提交即可；required 的拦截由浏览器自己完成
  document
    .getElementById("xh-signature-form")
    .addEventListener("submit", (event) => event.preventDefault());

  // 文案是对象，只走 property；属性装不下它
  document.getElementById("xh-signature-form-pad").translations = {
    statusEmpty: "尚未签名",
    statusSigned: "已签名",
  };
<\/script>
`;export{t as default};
