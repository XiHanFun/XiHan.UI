const d=`<!-- 列数 | columns 决定每行摆几组，一到六列；排版走 CSS Grid，不用表格 -->
<xh-descriptions columns="3">
  <dl data-xh-part="root">
    <div data-xh-part="item">
      <dt data-xh-part="label">姓名</dt>
      <dd data-xh-part="value">张三</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">工号</dt>
      <dd data-xh-part="value">A-1024</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">部门</dt>
      <dd data-xh-part="value">技术部</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">岗位</dt>
      <dd data-xh-part="value">前端工程师</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">入职</dt>
      <dd data-xh-part="value">2024-03-01</dd>
    </div>
    <div data-xh-part="item">
      <dt data-xh-part="label">座机</dt>
      <dd data-xh-part="value">8021</dd>
    </div>
  </dl>
</xh-descriptions>
`;export{d as default};
