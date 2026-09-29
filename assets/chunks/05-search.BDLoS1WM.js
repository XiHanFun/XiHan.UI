const a=`<!-- 搜索过滤 | 输入即按标签过滤导航树，命中入口的祖先自动展开，其余收起；Escape 清空检索词 -->
<xh-side-nav id="side-nav-search">
  <nav data-xh-part="root">
    <input data-xh-part="input" placeholder="搜索导航" />
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
    </ul>
    <div data-xh-part="empty"></div>
  </nav>
</xh-side-nav>

<script type="module">
  const nav = document.getElementById("side-nav-search");

  nav.translations = { input: "搜索导航", noMatch: "没有匹配的入口" };
  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#/dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#/user/list" },
        { value: "user-role", label: "角色权限", href: "#/user/role" },
      ],
    },
    {
      value: "order",
      label: "订单管理",
      children: [
        { value: "order-list", label: "订单列表", href: "#/order/list" },
        { value: "order-refund", label: "退款处理", href: "#/order/refund" },
      ],
    },
  ];
<\/script>
`;export{a as default};
