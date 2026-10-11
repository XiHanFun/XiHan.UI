var e=`<!-- 基础用法 | 一组字段收进原生 fieldset：legend 是该组的名字，说明文案自动派生 id 并接入 aria-describedby -->
<xh-fieldset>
  <fieldset data-xh-part="root" style="inline-size: 320px">
    <legend data-xh-part="legend">通知方式</legend>
    <xh-checkbox default-checked>
      <label data-xh-part="label">
        <button data-xh-part="root">
          <span data-xh-part="indicator"></span>
        </button>
        <span data-xh-part="text">站内消息</span>
      </label>
    </xh-checkbox>
    <xh-checkbox>
      <label data-xh-part="label">
        <button data-xh-part="root">
          <span data-xh-part="indicator"></span>
        </button>
        <span data-xh-part="text">邮件</span>
      </label>
    </xh-checkbox>
    <xh-checkbox>
      <label data-xh-part="label">
        <button data-xh-part="root">
          <span data-xh-part="indicator"></span>
        </button>
        <span data-xh-part="text">短信</span>
      </label>
    </xh-checkbox>
    <p data-xh-part="description">至少保留一种，重要变更会照此通知你</p>
  </fieldset>
</xh-fieldset>
`;export{e as default};