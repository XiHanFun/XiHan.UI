const a=`<!-- 尺寸 | 适配不同密度的应用侧栏 -->
<div id="side-nav-sizes" style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr))">
  <div style="display: grid; gap: 6px">
    <span style="color: var(--xh-fg-muted)">小</span>
    <xh-side-nav class="side-nav-size" size="sm" default-value="user-list">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" value="dashboard"><span data-xh-part="link-text">工作台</span></a></li>
          <li data-xh-part="branch" value="user">
            <button data-xh-part="branch-trigger"><span data-xh-part="branch-text">用户管理</span><span data-xh-part="branch-indicator"></span></button>
            <ul data-xh-part="branch-content">
              <li data-xh-part="item"><a data-xh-part="link" value="user-list"><span data-xh-part="link-text">用户列表</span></a></li>
              <li data-xh-part="item"><a data-xh-part="link" value="user-role"><span data-xh-part="link-text">角色权限</span></a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </xh-side-nav>
  </div>

  <div style="display: grid; gap: 6px">
    <span style="color: var(--xh-fg-muted)">中</span>
    <xh-side-nav class="side-nav-size" default-value="user-list">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" value="dashboard"><span data-xh-part="link-text">工作台</span></a></li>
          <li data-xh-part="branch" value="user">
            <button data-xh-part="branch-trigger"><span data-xh-part="branch-text">用户管理</span><span data-xh-part="branch-indicator"></span></button>
            <ul data-xh-part="branch-content">
              <li data-xh-part="item"><a data-xh-part="link" value="user-list"><span data-xh-part="link-text">用户列表</span></a></li>
              <li data-xh-part="item"><a data-xh-part="link" value="user-role"><span data-xh-part="link-text">角色权限</span></a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </xh-side-nav>
  </div>

  <div style="display: grid; gap: 6px">
    <span style="color: var(--xh-fg-muted)">大</span>
    <xh-side-nav class="side-nav-size" size="lg" default-value="user-list">
      <nav data-xh-part="root">
        <ul data-xh-part="list">
          <li data-xh-part="item"><a data-xh-part="link" value="dashboard"><span data-xh-part="link-text">工作台</span></a></li>
          <li data-xh-part="branch" value="user">
            <button data-xh-part="branch-trigger"><span data-xh-part="branch-text">用户管理</span><span data-xh-part="branch-indicator"></span></button>
            <ul data-xh-part="branch-content">
              <li data-xh-part="item"><a data-xh-part="link" value="user-list"><span data-xh-part="link-text">用户列表</span></a></li>
              <li data-xh-part="item"><a data-xh-part="link" value="user-role"><span data-xh-part="link-text">角色权限</span></a></li>
            </ul>
          </li>
        </ul>
      </nav>
    </xh-side-nav>
  </div>
</div>

<script type="module">
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

  for (const nav of document.querySelectorAll(".side-nav-size")) {
    nav.collection = collection;
    nav.expandedValue = ["user"];
    nav.addEventListener("expanded-value-change", (event) => {
      nav.expandedValue = event.detail.value;
    });
  }
<\/script>
`;export{a as default};
