const n=`<!-- 无效与必填 | invalid 一翻，错误文案接入描述链并显出，控件上同时落 aria-invalid；required 只落 aria-required，校验仍归宿主 -->
<xh-field id="field-invalid" required>
  <div data-xh-part="root" style="inline-size: 280px">
    <label data-xh-part="label">邮箱</label>
    <input
      data-xh-part="control"
      type="email"
      value="zhaifanhua"
      placeholder="you@example.com"
    />
    <p data-xh-part="description">用于接收账单与安全提醒</p>
    <!-- 错误文案带 role=alert，翻转的那一刻读屏立即播报 -->
    <p data-xh-part="error-text">邮箱格式不正确</p>
  </div>
</xh-field>

<script type="module">
  // 无效与否由宿主判定，Field 只负责把这个结论铺成属性
  const field = document.getElementById("field-invalid");
  const control = field.querySelector('[data-xh-part="control"]');
  const sync = () => {
    field.invalid = control.value !== "" && !control.value.includes("@");
  };
  control.addEventListener("input", sync);
  sync();
<\/script>
`;export{n as default};
