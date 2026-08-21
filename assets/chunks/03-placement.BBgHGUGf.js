const t=`<!-- 放置位与箭头 | placement 只是首选位，空间不够时定位引擎会自动翻面；arrow 指回触发器 -->
<xh-menu placement="right-start" offset="12">
  <button data-xh-part="trigger">贴右侧展开</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="profile">个人资料</div>
      <div data-xh-part="item" value="settings">偏好设置</div>
      <div data-xh-part="item" value="logout">退出登录</div>
    </div>
    <!-- 箭头挂在 positioner 上，位置由引擎回填 -->
    <div data-xh-part="arrow"></div>
  </div>
</xh-menu>
`;export{t as default};
