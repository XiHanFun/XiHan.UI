const e=`<!-- 无效态 | invalid 一翻，错误文案接进描述链并显出；它带 role=alert，翻转那一刻读屏立即播报 -->
<xh-fieldset id="fieldset-contact" invalid>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">联系方式</legend>
    <input type="email" placeholder="邮箱" style="inline-size: 100%" />
    <input type="tel" placeholder="手机号" style="inline-size: 100%" />
    <p data-xh-part="helper-text">两者填一个即可</p>
    <p data-xh-part="error-text">请至少填写一种联系方式</p>
  </fieldset>
</xh-fieldset>

<script type="module">
  // 整组的校验结论由宿主判定，字段集只负责把它铺成属性
  const contact = document.getElementById("fieldset-contact");
  const inputs = [...contact.querySelectorAll("input")];
  const sync = () => {
    contact.invalid = inputs.every((el) => el.value === "");
  };
  for (const el of inputs) el.addEventListener("input", sync);
  sync();
<\/script>
`;export{e as default};
