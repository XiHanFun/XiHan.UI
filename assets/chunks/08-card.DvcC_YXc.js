var e=`<!-- 卡片 | variant="card" 把每个选项画成一张可点的卡，文案下方用说明行交代差别 -->
<xh-radio-group variant="card" default-value="team">
  <div data-xh-part="root" style="max-inline-size: 24rem">
    <span data-xh-part="label">套餐</span>
    <div data-xh-part="item" value="personal">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">个人版</span>
      <span data-xh-part="item-description">1 位成员，10 GB 存储</span>
    </div>
    <div data-xh-part="item" value="team">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">团队版</span>
      <span data-xh-part="item-description">最多 20 位成员，100 GB 存储</span>
    </div>
    <div data-xh-part="item" value="enterprise">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">企业版</span>
      <span data-xh-part="item-description">成员不限，按需扩容与专属支持</span>
    </div>
  </div>
</xh-radio-group>
`;export{e as default};