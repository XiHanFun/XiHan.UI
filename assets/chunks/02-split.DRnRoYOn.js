const t=`<!-- 分隔线 | split 在条目之间画一条线，第一条上面不画 -->
<!-- 宿主设 display: contents，列表落在 root 上 -->
<xh-list split style="display: contents">
  <ul data-xh-part="root" style="max-inline-size: 360px">
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">提交了一次构建</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">合并了一个分支</div>
      </div>
    </li>
    <li data-xh-part="item">
      <div data-xh-part="item-content">
        <div data-xh-part="item-title">关闭了一个议题</div>
      </div>
    </li>
  </ul>
</xh-list>
`;export{t as default};
