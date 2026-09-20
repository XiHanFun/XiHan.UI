const a=`<!-- 尺寸 | size 决定方框与条目文字的几何档位，组标题不随档 -->
<div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
  <xh-checkbox-group size="sm" default-value="email">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
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

  <xh-checkbox-group default-value="email">
    <div data-xh-part="root">
      <span data-xh-part="label">md</span>
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

  <xh-checkbox-group size="lg" default-value="email">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
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
