const a=`<!-- 变体 | primary 用于页面背景，secondary 用于卡片等已有表面 -->
<div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
  <xh-checkbox-group default-value="email">
    <div data-xh-part="root">
      <span data-xh-part="label">主要</span>
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
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group variant="secondary" default-value="email">
    <div data-xh-part="root">
      <span data-xh-part="label">次要</span>
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
    </div>
  </xh-checkbox-group>
</div>
`;export{a as default};
