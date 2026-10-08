var e=`<!-- 图标栏名称提示 | 折叠成图标栏后，悬停或聚焦只剩图标的入口时在旁侧显示它的名称 -->
<xh-side-nav id="side-nav-collapsed-tooltip" collapsed default-value="dashboard">
  <nav data-xh-part="root">
    <ul data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" value="dashboard">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 10.5L12 3.5L20.5 10.5V20.5H3.5Z"/><path d="M9.5 20.5V14h5v6.5"/></svg>
          <span data-xh-part="link-text">工作台</span>
        </a>
      </li>
      <li data-xh-part="item">
        <a data-xh-part="link" value="user">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M15 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 3 18.5V20"/><path d="M16 4.62a3.5 3.5 0 0 1 0 6.76"/><path d="M21 20v-1.5a3.5 3.5 0 0 0-2.63-3.39"/></svg>
          <span data-xh-part="link-text">用户管理</span>
        </a>
      </li>
      <li data-xh-part="item">
        <a data-xh-part="link" value="order">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.2L8 14h10.5"/><path d="M6.18 7.5H21L18.5 14"/><circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>
          <span data-xh-part="link-text">订单管理</span>
        </a>
      </li>
      <li data-xh-part="item">
        <a data-xh-part="link" value="system">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.57 13.76L21.66 14.59L19.07 19.07L16.81 16.81L13.76 18.57L14.59 21.66L9.41 21.66L10.24 18.57L7.19 16.81L4.93 19.07L2.34 14.59L5.43 13.76L5.43 10.24L2.34 9.41L4.93 4.93L7.19 7.19L10.24 5.43L9.41 2.34L14.59 2.34L13.76 5.43L16.81 7.19L19.07 4.93L21.66 9.41L18.57 10.24Z"/><circle cx="12" cy="12" r="3"/></svg>
          <span data-xh-part="link-text">系统设置</span>
        </a>
      </li>
    </ul>
    <div data-xh-part="tooltip-positioner">
      <div data-xh-part="tooltip"></div>
    </div>
  </nav>
</xh-side-nav>

<script type="module">
  const nav = document.getElementById("side-nav-collapsed-tooltip");

  nav.collection = [
    { value: "dashboard", label: "工作台", href: "#/dashboard" },
    { value: "user", label: "用户管理", href: "#/user" },
    { value: "order", label: "订单管理", href: "#/order" },
    { value: "system", label: "系统设置", href: "#/system" },
  ];
<\/script>
`;export{e as default};