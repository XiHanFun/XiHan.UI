const t=`<!-- 注册表单 | 提供 name 后才参与提交，auto-complete 写为 new-password 密码管理器才会保存新密码而不是填入旧密码 -->
<!-- 点表单的重置：值回到 default-value，明文也一并收起来 -->
<form style="display: flex; align-items: flex-end; gap: 8px">
  <xh-password-input name="new-password" auto-complete="new-password" default-value="" required>
    <div data-xh-part="root">
      <label data-xh-part="label">设置新密码</label>
      <div data-xh-part="control">
        <input data-xh-part="input" />
        <button data-xh-part="visibility-trigger"></button>
      </div>
    </div>
  </xh-password-input>
  <button type="reset">重置</button>
</form>
`;export{t as default};
