const n=`<!-- 基础用法 | root 持有状态，control 是那个视觉盒；不传 value 与 visible 即为非受控，明暗由组件自己管，钮里的图标跟着明暗换 -->
<xh-password-input id="password-input-basic" placeholder="请输入密码">
  <div data-xh-part="root">
    <label data-xh-part="label">密码</label>
    <div data-xh-part="control">
      <input data-xh-part="input" style="inline-size: 200px" />
      <!-- 节点留空，大写锁定开着时元素把文字写进来，读屏念的就是这一段 -->
      <span data-xh-part="caps-lock-indicator"></span>
      <!-- 留空即使用皮肤内置的显示/隐藏图标，名字也由组件按状态切换 -->
      <button data-xh-part="visibility-trigger"></button>
    </div>
  </div>
</xh-password-input>

<script type="module">
  // 大写锁定提示文案由组件写入对应状态区
  const field = document.getElementById("password-input-basic");

  field.translations = {
    visibilityTriggerShow: "显示密码",
    visibilityTriggerHide: "隐藏密码",
    capsLockOn: "大写锁定已打开",
    strengthMeter: "密码强度",
  };
<\/script>
`;export{n as default};
