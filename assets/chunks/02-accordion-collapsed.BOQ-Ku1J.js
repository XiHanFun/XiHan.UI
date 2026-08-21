const n=`<!-- 手风琴与折叠 | accordion 让同层只开一枝；collapsed 折叠成图标栏（内嵌展开整体收起，文字部件整个隐藏只剩图标），折叠态下悬停/点按/右方向键在旁侧弹出子级面板，面板内选中即落值收起；collapsedPopout 设为 false 可关掉弹出 -->
<div style="display: grid; gap: 12px; justify-items: start">
  <xh-button variant="outline">
    <button data-xh-part="root" id="side-nav-collapse-toggle">折叠成图标栏</button>
  </xh-button>

  <xh-side-nav id="side-nav-accordion" accordion>
    <nav
      data-xh-part="root"
      style="border: 1px solid var(--xh-border-default); border-radius: 8px"
    >
      <ul data-xh-part="list">
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <span aria-hidden="true">▦</span>
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator">›</span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li>
                <a data-xh-part="link" value="user-list">
                  <span data-xh-part="link-text">用户列表</span>
                </a>
              </li>
              <li>
                <a data-xh-part="link" value="user-role">
                  <span data-xh-part="link-text">角色权限</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li data-xh-part="branch" value="order">
          <button data-xh-part="branch-trigger">
            <span aria-hidden="true">▦</span>
            <span data-xh-part="branch-text">订单管理</span>
            <span data-xh-part="branch-indicator">›</span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li>
                <a data-xh-part="link" value="order-list">
                  <span data-xh-part="link-text">订单列表</span>
                </a>
              </li>
            </ul>
          </div>
        </li>
        <li data-xh-part="branch" value="system">
          <button data-xh-part="branch-trigger">
            <span aria-hidden="true">▦</span>
            <span data-xh-part="branch-text">系统设置</span>
            <span data-xh-part="branch-indicator">›</span>
          </button>
          <div data-xh-part="positioner">
            <ul data-xh-part="branch-content">
              <li>
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
</div>

<script type="module">
  const nav = document.getElementById("side-nav-accordion");
  const toggle = document.getElementById("side-nav-collapse-toggle");

  // 入口树是 href 与层级的事实源，数组只能走 property
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

  toggle.addEventListener("click", () => {
    nav.collapsed = !nav.collapsed;
    toggle.textContent = nav.collapsed ? "展开侧栏" : "折叠成图标栏";
  });
<\/script>
`;export{n as default};
