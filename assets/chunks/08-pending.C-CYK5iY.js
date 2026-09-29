const t=`<!-- 待定项 | 还在等的那一步写在末尾：圆点换成转圈、去掉底色，文字说明在等什么；办成后换成普通条目 -->
<xh-timeline>
  <ol data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item" tone="success">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09-25 14:20</time>
        <div data-xh-part="title">提交报销</div>
        <div data-xh-part="description">差旅费 · ¥3,280</div>
      </div>
    </li>
    <li data-xh-part="item" tone="success">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09-25 17:05</time>
        <div data-xh-part="title">部门经理通过</div>
        <div data-xh-part="description">王五 · 附言“同意”</div>
      </div>
    </li>
    <!-- 待定的一步：没有时刻，只说在等什么 -->
    <li data-xh-part="item">
      <span data-xh-part="indicator" style="--xh-timeline-indicator-bg: transparent">
        <xh-spinner size="sm" label="等待财务审批">
          <span data-xh-part="root"></span>
        </xh-spinner>
      </span>
      <div data-xh-part="content">
        <div data-xh-part="title">等待财务审批</div>
        <div data-xh-part="description">通常在一个工作日内处理</div>
      </div>
    </li>
  </ol>
</xh-timeline>
`;export{t as default};
