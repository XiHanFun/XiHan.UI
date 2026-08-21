const t=`<!-- 尺寸 | size 换的是条目的内边距、间距与字号；三档各挂一个菜单，逐个展开对比 -->
<div style="display: flex; flex-wrap: wrap; gap: 8px">
  <xh-menu size="sm">
    <button data-xh-part="trigger">sm</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="profile">个人资料</div>
        <div data-xh-part="item" value="settings">偏好设置</div>
        <div data-xh-part="item" value="logout">退出登录</div>
      </div>
    </div>
  </xh-menu>

  <!-- 不写 size 就是缺省档 -->
  <xh-menu>
    <button data-xh-part="trigger">缺省</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="profile">个人资料</div>
        <div data-xh-part="item" value="settings">偏好设置</div>
        <div data-xh-part="item" value="logout">退出登录</div>
      </div>
    </div>
  </xh-menu>

  <xh-menu size="lg">
    <button data-xh-part="trigger">lg</button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="profile">个人资料</div>
        <div data-xh-part="item" value="settings">偏好设置</div>
        <div data-xh-part="item" value="logout">退出登录</div>
      </div>
    </div>
  </xh-menu>
</div>
`;export{t as default};
