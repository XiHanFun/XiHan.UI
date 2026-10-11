var e=`<!-- 必填标记 | required 写为 data-required，皮肤据此为组标题加星号；星号只是视觉冗余，必填这一信息要一并写进文案 -->
<xh-fieldset required>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">配送时段</legend>
    <!-- 组标题只命名外层这一段，内层的单选组要自己的名字 -->
    <xh-radio-group name="fieldset-slot">
      <div data-xh-part="root" aria-label="配送时段">
        <div data-xh-part="item" value="am">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">上午（9:00–12:00）</span>
        </div>
        <div data-xh-part="item" value="pm">
          <input data-xh-part="hidden-input" />
          <span data-xh-part="indicator"></span>
          <span data-xh-part="item-text">下午（13:00–18:00）</span>
        </div>
      </div>
    </xh-radio-group>
    <p data-xh-part="description">必选一项，下单后不可更改</p>
  </fieldset>
</xh-fieldset>
`;export{e as default};