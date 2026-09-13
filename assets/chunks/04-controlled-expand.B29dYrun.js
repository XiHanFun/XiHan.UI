const a=`<!-- 禁用项 | 保留不可用入口的位置与说明 -->
  <xh-side-nav id="side-nav-controlled" default-value="user-list" loop>
    <nav data-xh-part="root">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台</span>
          </a>
        </li>
        <li data-xh-part="branch" value="user">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">用户管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
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
        </li>
        <li data-xh-part="branch" value="order">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">订单管理</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="order-list">
                <span data-xh-part="link-text">订单列表</span>
              </a>
            </li>
            <li data-xh-part="item">
              <a data-xh-part="link" value="order-refund">
                <span data-xh-part="link-text">退款处理</span>
              </a>
            </li>
          </ul>
        </li>
        <li data-xh-part="branch" value="system">
          <button data-xh-part="branch-trigger">
            <span data-xh-part="branch-text">系统设置</span>
            <span data-xh-part="branch-indicator"></span>
          </button>
          <ul data-xh-part="branch-content">
            <li data-xh-part="item">
              <a data-xh-part="link" value="system-log">
                <span data-xh-part="link-text">操作日志</span>
              </a>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </xh-side-nav>

<script type="module">
  const nav = document.getElementById("side-nav-controlled");

  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#dashboard" },
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
      children: [
        { value: "order-list", label: "订单列表", href: "#order-list" },
        { value: "order-refund", label: "退款处理", disabled: true },
      ],
    },
    {
      value: "system",
      label: "系统设置",
      children: [{ value: "system-log", label: "操作日志", href: "#system-log" }],
    },
  ];

  nav.expandedValue = ["user", "order"];
  nav.addEventListener("expanded-value-change", (event) => {
    nav.expandedValue = event.detail.value;
  });
<\/script>
`;export{a as default};
