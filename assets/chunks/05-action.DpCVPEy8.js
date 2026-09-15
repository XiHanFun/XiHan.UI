const t=`<!-- 操作 | 将与提示直接相关的短操作放在尾端 -->
<div style="width: 100%">
  <xh-alert tone="warning">
    <div data-xh-part="root">
      <div data-xh-part="content">
        <div data-xh-part="title">配额即将用尽</div>
        <div data-xh-part="description">本月还可处理 120 次请求。</div>
      </div>
      <div data-xh-part="action">
        <xh-button size="sm" variant="outline"><button data-xh-part="root">查看用量</button></xh-button>
      </div>
    </div>
  </xh-alert>
</div>
`;export{t as default};
