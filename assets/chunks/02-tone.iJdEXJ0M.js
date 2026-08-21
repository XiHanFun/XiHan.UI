const t=`<!-- 逐条语气 | tone 写在条目上，只给这一条的圆点上色；不写 tone 的条目是中性圆点 -->
<xh-timeline>
  <ol data-xh-part="root" style="max-inline-size: 360px">
    <!-- 第一条不写 tone -->
    <li data-xh-part="item">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09:12</time>
        <div data-xh-part="title">收到请求</div>
        <div data-xh-part="description">队列长度 3</div>
      </div>
    </li>
    <li data-xh-part="item" tone="info">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09:13</time>
        <div data-xh-part="title">开始构建</div>
        <div data-xh-part="description">拉取依赖</div>
      </div>
    </li>
    <li data-xh-part="item" tone="warning">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09:21</time>
        <div data-xh-part="title">两条依赖有告警</div>
        <div data-xh-part="description">已按锁文件继续</div>
      </div>
    </li>
    <li data-xh-part="item" tone="danger">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09:26</time>
        <div data-xh-part="title">单元测试失败</div>
        <div data-xh-part="description">3 个用例未通过</div>
      </div>
    </li>
    <li data-xh-part="item" tone="success">
      <span data-xh-part="indicator"></span>
      <span data-xh-part="connector"></span>
      <div data-xh-part="content">
        <time data-xh-part="time">09:41</time>
        <div data-xh-part="title">重跑后通过</div>
        <div data-xh-part="description">产物已上传</div>
      </div>
    </li>
  </ol>
</xh-timeline>
`;export{t as default};
