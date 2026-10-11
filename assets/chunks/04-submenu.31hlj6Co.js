var e=`<!-- 子菜单 | 将相关操作收进下一层 -->
<xh-menu>
  <xh-button data-xh-part="trigger" variant="subtle">
    <button data-xh-part="root">文件操作</button>
  </xh-button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <div data-xh-part="item" value="open">打开</div>
      <div data-xh-part="item" value="rename">重命名</div>
      <div data-xh-part="separator"></div>
      <xh-menu submenu open-on-hover placement="right-start" style="display: contents">
        <div data-xh-part="trigger" value="share">发送到</div>
        <div data-xh-part="positioner">
          <div data-xh-part="content">
            <div data-xh-part="item" value="email">邮件</div>
            <div data-xh-part="item" value="message">消息</div>
          </div>
        </div>
      </xh-menu>
      <div data-xh-part="separator"></div>
      <div data-xh-part="item" value="delete">移到回收站</div>
    </div>
  </div>
</xh-menu>
`;export{e as default};