const t=`<!-- 菜单里的非条目内容 | content 里可以直接放任意节点；不是 item 就不进方向键行程，也选不中 -->
<xh-menu>
  <button data-xh-part="trigger">账号</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <!-- 这一块是普通节点：方向键从首个条目起步，不会停在它上面 -->
      <div style="display: grid; gap: 4px; padding: 8px 8px 6px">
        <span style="font-weight: 600">曦寒</span>
        <span style="font-size: 12px; color: var(--xh-fg-muted)">已用 6.2 GB / 20 GB</span>
      </div>

      <div data-xh-part="separator"></div>

      <div data-xh-part="item" value="profile">个人资料</div>
      <div data-xh-part="item" value="billing">账单与用量</div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="logout">退出登录</div>
    </div>
  </div>
</xh-menu>
`;export{t as default};
