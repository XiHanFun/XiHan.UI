const t=`<!-- 基础用法 | 图标、标题、说明、操作四段按需摆，只有 root 必须写 -->
<xh-result status="success">
  <div data-xh-part="root">
    <span data-xh-part="icon"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg></span>
    <p data-xh-part="title">订单已提交</p>
    <p data-xh-part="description">
      单号 2026-0810-3312，两个工作日内发货，物流单号会发到你的手机上。
    </p>
    <div data-xh-part="action">
      <xh-button tone="brand" variant="solid">
        <button data-xh-part="root">查看订单</button>
      </xh-button>
      <xh-button variant="outline">
        <button data-xh-part="root">继续逛逛</button>
      </xh-button>
    </div>
  </div>
</xh-result>
`;export{t as default};
