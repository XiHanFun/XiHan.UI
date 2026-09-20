const t=`<!-- 形态 | outline 画描边输入面，subtle 用淡底嵌入已有表面 -->
<div style="display: flex; flex-wrap: wrap; gap: 12px">
  <xh-input-group variant="outline">
    <div data-xh-part="root">
      <span data-xh-part="item">¥</span>
      <xh-text-field placeholder="描边表面">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" inputmode="decimal" aria-label="描边金额" />
          </div>
        </div>
      </xh-text-field>
    </div>
  </xh-input-group>

  <xh-input-group variant="subtle">
    <div data-xh-part="root">
      <span data-xh-part="item">¥</span>
      <xh-text-field placeholder="淡底表面">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <input data-xh-part="input" inputmode="decimal" aria-label="淡底金额" />
          </div>
        </div>
      </xh-text-field>
    </div>
  </xh-input-group>
</div>
`;export{t as default};
