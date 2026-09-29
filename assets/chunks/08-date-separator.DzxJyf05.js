const a=`<!-- 按日期分隔 | 跨天的消息之间放一条 separator，与条目平级写在列表里；它对读屏隐藏，时间由消息自己的时间戳表达 -->
<xh-message-feed count="4">
  <div data-xh-part="root" style="block-size: 280px">
    <div data-xh-part="viewport">
      <div data-xh-part="list">
        <div data-xh-part="separator">9 月 27 日</div>
        <article data-xh-part="item" item-id="m1" item-index="0" item-role="user">
          <span data-xh-part="item-label">我 · 21:40</span>
          <div>明天的发布清单整理好了吗？</div>
        </article>
        <article data-xh-part="item" item-id="m2" item-index="1" item-role="assistant">
          <span data-xh-part="item-label">助手 · 21:41</span>
          <div>整理好了，一共 12 项，明早再核一遍。</div>
        </article>
        <div data-xh-part="separator">今天</div>
        <article data-xh-part="item" item-id="m3" item-index="2" item-role="user">
          <span data-xh-part="item-label">我 · 09:02</span>
          <div>开始核对吧。</div>
        </article>
        <article data-xh-part="item" item-id="m4" item-index="3" item-role="assistant">
          <span data-xh-part="item-label">助手 · 09:02</span>
          <div>第 1 项：构建产物已上传。</div>
        </article>
      </div>
    </div>
  </div>
</xh-message-feed>
`;export{a as default};
