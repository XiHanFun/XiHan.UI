const t=`<!-- 标签栏前后缀 | list 里只收 trigger；要在标签栏两侧摆东西，把它们与 list 排进同一行 -->
<xh-tabs default-value="all" variant="segment">
  <div data-xh-part="root" style="inline-size: 100%">
    <!-- 前后缀是这一行的兄弟节点，不进 list：list 里只放标签 -->
    <div style="display: flex; align-items: center; gap: 12px">
      <span style="font-size: 12px">收件箱</span>
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="all">全部</button>
        <button data-xh-part="trigger" value="unread">未读</button>
        <button data-xh-part="trigger" value="flagged">已标记</button>
      </div>
      <xh-button size="sm" variant="outline" style="margin-inline-start: auto">
        <button data-xh-part="root">写邮件</button>
      </xh-button>
    </div>

    <div data-xh-part="content" value="all">全部邮件。</div>
    <div data-xh-part="content" value="unread">未读邮件。</div>
    <div data-xh-part="content" value="flagged">已标记邮件。</div>
  </div>
</xh-tabs>
`;export{t as default};
