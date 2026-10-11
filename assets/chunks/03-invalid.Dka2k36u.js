var e=`<!-- 无效态 | invalid 切换后，错误文案接入描述链并显示；它带 role=alert，切换时读屏立即播报 -->
<xh-fieldset id="fieldset-contact" invalid>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">联系方式</legend>
    <xh-field>
      <div data-xh-part="root">
        <label data-xh-part="label">邮箱</label>
        <input data-xh-part="control" type="email" />
      </div>
    </xh-field>
    <xh-field>
      <div data-xh-part="root">
        <label data-xh-part="label">手机号</label>
        <input data-xh-part="control" type="tel" />
      </div>
    </xh-field>
    <p data-xh-part="description">两者填一个即可</p>
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