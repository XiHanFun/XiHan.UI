var e=`<!-- 提交在途 | 提交回调返回 Promise：落定之前 submitting 为真，提交钮报在途、再按也不会重复提交；拒绝经 submit-error 报出 -->
<xh-form id="form-async-submit">
  <form data-xh-part="root" style="inline-size: 320px; display: grid; gap: 12px">
    <div data-xh-part="field-group" name="nickname">
      <xh-field>
        <div data-xh-part="root">
          <label data-xh-part="label">昵称</label>
          <input data-xh-part="control" value="小明" />
        </div>
      </xh-field>
    </div>

    <button data-xh-part="submit-trigger">保存</button>
    <p id="form-async-submit-status">尚未保存</p>
  </form>
</xh-form>

<script type="module">
  const host = document.getElementById("form-async-submit");
  const trigger = host.querySelector('[data-xh-part="submit-trigger"]');
  const status = document.getElementById("form-async-submit-status");

  host.defaultValues = { nickname: "小明" };
  const input = host.querySelector('[data-xh-part="control"]');
  input.addEventListener("input", () => host.setFieldValue("nickname", input.value));

  // 事件拿不到监听函数的返回值：异步提交交给 submitAction，返回 Promise 即进入提交在途（函数只走属性）
  host.submitAction = ({ values }) => new Promise((resolve) => {
    trigger.textContent = "保存中…";
    // 保存请求在后端，这里用定时器代替
    setTimeout(() => {
      status.textContent = \`已保存：\${values.nickname}\`;
      trigger.textContent = "保存";
      resolve();
    }, 1500);
  });
<\/script>
`;export{e as default};