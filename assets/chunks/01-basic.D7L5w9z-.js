const a=`<!-- 基础用法 | 交一份命令清单，过滤、归组与空态都由组件包办 -->
<xh-command
  id="command-basic"
  placeholder="搜命令…"
>
  <button data-xh-part="trigger">打开命令面板</button>
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <input data-xh-part="input" />
      <div data-xh-part="list">
        <div data-xh-part="group" value="nav">
          <span data-xh-part="group-label">页面</span>
          <div data-xh-part="item" value="users">
            <span data-xh-part="item-text">用户管理</span>
          </div>
          <div data-xh-part="item" value="roles">
            <span data-xh-part="item-text">角色管理</span>
          </div>
          <div data-xh-part="item" value="profile">
            <span data-xh-part="item-text">个人资料</span>
          </div>
        </div>
        <div data-xh-part="group" value="action">
          <span data-xh-part="group-label">动作</span>
          <div data-xh-part="item" value="export">
            <span data-xh-part="item-text">导出报表</span>
          </div>
          <div data-xh-part="item" value="invite">
            <span data-xh-part="item-text">邀请成员</span>
          </div>
          <div data-xh-part="item" value="archive">
            <span data-xh-part="item-text">归档项目</span>
          </div>
        </div>
      </div>
      <div data-xh-part="empty">没有匹配的命令</div>
      <div data-xh-part="loading">正在取命令…</div>
      <footer data-xh-part="footer">↑↓ 选择 · ↵ 执行 · Esc 关闭</footer>
    </div>
  </div>
</xh-command>
<p id="command-basic-readout">还没执行过命令</p>

<script type="module">
  // 命令清单只走 property：过滤、归组与禁用都以它为准，
  // 标记里那几个条目节点只报 value，露不露面由元素打的 hidden 说了算
  const host = document.getElementById("command-basic");
  host.collection = [
    { value: "users", label: "用户管理", group: "nav", keywords: ["users"] },
    { value: "roles", label: "角色管理", group: "nav", keywords: ["roles"] },
    { value: "profile", label: "个人资料", group: "nav" },
    { value: "export", label: "导出报表", group: "action", keywords: ["export"] },
    { value: "invite", label: "邀请成员", group: "action" },
    { value: "archive", label: "归档项目", group: "action", disabled: true },
  ];
  host.groups = [
    { value: "nav", label: "页面" },
    { value: "action", label: "动作" },
  ];

  const readout = document.getElementById("command-basic-readout");
  host.addEventListener("select", (event) => {
    readout.textContent = \`执行了：\${event.detail.label}\`;
  });
<\/script>
`;export{a as default};
