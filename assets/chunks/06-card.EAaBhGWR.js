var e=`<!-- 卡片 | variant="card" 把每个选项画成一张可点的卡；collection 里的 description 铺成文案下方的说明行 -->
<xh-checkbox-group variant="card" default-value="email">
  <div data-xh-part="root" style="max-inline-size: 24rem">
    <span data-xh-part="label">通知方式</span>
    <div data-xh-part="item" value="email">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">邮件</span>
      <span data-xh-part="item-description">每天早上汇总一封</span>
    </div>
    <div data-xh-part="item" value="sms">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">短信</span>
      <span data-xh-part="item-description">只发需要立即处理的事项</span>
    </div>
    <div data-xh-part="item" value="push">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">推送通知</span>
      <span data-xh-part="item-description">在手机与桌面端即时提醒</span>
    </div>
  </div>
</xh-checkbox-group>
`;export{e as default};