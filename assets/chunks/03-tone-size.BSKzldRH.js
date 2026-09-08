const a=`<!-- 语气与尺寸 | tone 换选中行与展开枝用哪族颜色，size 换行高与缩进档；两轴都打在 root 上，逐层继承 -->
<div style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
  <xh-side-nav class="side-nav-axes" tone="success" default-value="user-list">
    <nav data-xh-part="root" style="border: 1px solid var(--xh-border-default); border-radius: 8px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台 · success</span>
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
      </ul>
    </nav>
  </xh-side-nav>

  <xh-side-nav class="side-nav-axes" tone="danger" default-value="user-list">
    <nav data-xh-part="root" style="border: 1px solid var(--xh-border-default); border-radius: 8px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台 · danger</span>
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
      </ul>
    </nav>
  </xh-side-nav>

  <xh-side-nav class="side-nav-axes" size="sm" default-value="user-list">
    <nav data-xh-part="root" style="border: 1px solid var(--xh-border-default); border-radius: 8px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台 · sm</span>
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
      </ul>
    </nav>
  </xh-side-nav>

  <xh-side-nav class="side-nav-axes" size="lg" default-value="user-list">
    <nav data-xh-part="root" style="border: 1px solid var(--xh-border-default); border-radius: 8px">
      <ul data-xh-part="list">
        <li data-xh-part="item">
          <a data-xh-part="link" value="dashboard">
            <span data-xh-part="link-text">工作台 · lg</span>
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
      </ul>
    </nav>
  </xh-side-nav>
</div>

<script type="module">
  // 入口树与展开集合都是数组，只走 property：四份共用同一棵树
  const collection = [
    { value: "dashboard", label: "工作台", href: "#dashboard" },
    {
      value: "user",
      label: "用户管理",
      children: [
        { value: "user-list", label: "用户列表", href: "#user-list" },
        { value: "user-role", label: "角色权限", href: "#user-role" },
      ],
    },
  ];
  for (const nav of document.querySelectorAll(".side-nav-axes")) {
    nav.collection = collection;
    nav.expandedValue = ["user"];
    nav.addEventListener("expanded-value-change", (event) => {
      nav.expandedValue = event.detail.value;
    });
  }
<\/script>
`;export{a as default};
