const a=`<!-- 折叠模式 | 以图标保留入口，子级在浮层中展开 -->
  <xh-side-nav id="side-nav-accordion" collapsed accordion>
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 3 18.5V20"/><path d="M16 4.62a3.5 3.5 0 0 1 0 6.76"/><path d="M21 20v-1.5a3.5 3.5 0 0 0-2.63-3.39"/></svg>
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li data-xh-part="item">
                <a data-xh-part="link" value="user-list">
                  <span data-xh-part="link-text">用户列表</span>
                </a>
              </li>
              <li data-xh-part="item">
                <a data-xh-part="link" value="user-role">
                  <span data-xh-part="link-text">角色权限</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li data-xh-part="branch" value="order">
          <button data-xh-part="branch-trigger">
            <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2L8 14h10.5"/><path d="M6.18 7.5H21L18.5 14"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>
            <span data-xh-part="branch-text">订单管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li data-xh-part="item">
                <a data-xh-part="link" value="order-list">
                  <span data-xh-part="link-text">订单列表</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li data-xh-part="branch" value="system">
          <button data-xh-part="branch-trigger">
            <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.57 13.76L21.66 14.59L19.07 19.07L16.81 16.81L13.76 18.57L14.59 21.66L9.41 21.66L10.24 18.57L7.19 16.81L4.93 19.07L2.34 14.59L5.43 13.76L5.43 10.24L2.34 9.41L4.93 4.93L7.19 7.19L10.24 5.43L9.41 2.34L14.59 2.34L13.76 5.43L16.81 7.19L19.07 4.93L21.66 9.41L18.57 10.24Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span data-xh-part="branch-text">系统设置</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li data-xh-part="item">
                <a data-xh-part="link" value="system-log">
                  <span data-xh-part="link-text">操作日志</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </nav>
  </xh-side-nav>

<script type="module">
  const nav = document.getElementById("side-nav-accordion");

  nav.collection = [
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#user-list" },
        { value: "user-role", label: "角色权限", href: "#user-role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [{ value: "order-list", label: "订单列表", href: "#order-list" }],
    },
    {
      value: "system",
      label: "系统设置",
      children: [{ value: "system-log", label: "操作日志", href: "#system-log" }],
    },
  ];

<\/script>
`;export{a as default};
