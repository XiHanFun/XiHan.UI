const e=`<!-- 必填标记 | required 落成 data-required，皮肤据此给组标题加星号；星号只是视觉冗余，必填这件事要一并写进文案 -->
<xh-fieldset required>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">配送时段</legend>
    <label style="display: flex; gap: 8px; align-items: center">
      <input type="radio" name="fieldset-slot" value="am" />
      上午（9:00–12:00）
    </label>
    <label style="display: flex; gap: 8px; align-items: center">
      <input type="radio" name="fieldset-slot" value="pm" />
      下午（13:00–18:00）
    </label>
    <p data-xh-part="helper-text">必选一项，下单后不可更改</p>
  </fieldset>
</xh-fieldset>
`;export{e as default};
