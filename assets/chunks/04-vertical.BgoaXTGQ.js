const t=`<!-- 竖排 | orientation="vertical" 把入口排成一列、面板改从侧边长出来，方向键随之改收上下键 -->
<div style="inline-size: 100%; padding-block-end: 40px">
  <xh-navigation-menu orientation="vertical" style="display: contents">
    <nav data-xh-part="root" style="inline-size: 180px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="system">系统管理</button>
          <div data-xh-part="content" value="system">
            <a data-xh-part="link" href="#/system/user">用户</a>
            <a data-xh-part="link" href="#/system/role">角色</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="monitor">运行监控</button>
          <div data-xh-part="content" value="monitor">
            <a data-xh-part="link" href="#/monitor/online">在线用户</a>
            <a data-xh-part="link" href="#/monitor/job">定时任务</a>
          </div>
        </li>
        <li data-xh-part="item">
          <button data-xh-part="trigger" value="tool">系统工具</button>
          <div data-xh-part="content" value="tool">
            <a data-xh-part="link" href="#/tool/codegen">代码生成</a>
          </div>
        </li>
        <li data-xh-part="indicator"></li>
      </ul>
    </nav>
  </xh-navigation-menu>
</div>
`;export{t as default};
