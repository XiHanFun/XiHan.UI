const t=`<!-- 语气 | tone 只改配色，语义仍由内容与 role 决定 -->
<div style="width: 100%; display: grid; gap: 12px">
  <xh-alert tone="success">
    <div data-xh-part="root">
      <div data-xh-part="title">保存成功</div>
    </div>
  </xh-alert>
  <xh-alert tone="warning">
    <div data-xh-part="root">
      <div data-xh-part="title">配额即将用尽</div>
    </div>
  </xh-alert>
  <xh-alert tone="danger">
    <div data-xh-part="root">
      <div data-xh-part="title">发布失败</div>
    </div>
  </xh-alert>
</div>
`;export{t as default};
