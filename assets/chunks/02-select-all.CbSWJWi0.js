const a=`<!-- 全选与半选 | 使用 itemValues 计算全选和半选状态 -->
<xh-checkbox-group default-value="email" item-values="email,sms,push">
  <div data-xh-part="root">
    <span data-xh-part="label">通知方式</span>
    <div data-xh-part="select-all-trigger">全选</div>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送通知</span>
    </div>
  </div>
</xh-checkbox-group>
`;export{a as default};
