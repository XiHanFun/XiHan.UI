const t=`<!-- 外框与悬停 | bordered 给整份列表画一圈描边，hoverable 让条目在指针悬停时换底色 -->
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list bordered hoverable split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">设计稿.fig</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">接口文档.md</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">会议纪要.docx</div>
      </div>
    </li>
  </ul>
</xh-list>
`;export{t as default};
