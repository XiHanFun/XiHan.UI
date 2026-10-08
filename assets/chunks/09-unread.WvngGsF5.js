var e=`<!-- 回到底部带未读数 | 离开底部期间新到的消息记成未读，数字挂在回到底部按钮上并进入它的可访问名；回到底部即清零 -->
<xh-message-feed id="message-feed-unread" count="8">
  <div data-xh-part="root" style="block-size: 240px">
    <div data-xh-part="viewport">
      <div data-xh-part="list">
        <article data-xh-part="item" item-id="m1" item-index="0" item-role="assistant">第 1 条：往上翻，之后到的消息会记成未读。</article>
        <article data-xh-part="item" item-id="m2" item-index="1" item-role="assistant">第 2 条消息。</article>
        <article data-xh-part="item" item-id="m3" item-index="2" item-role="assistant">第 3 条消息。</article>
        <article data-xh-part="item" item-id="m4" item-index="3" item-role="assistant">第 4 条消息。</article>
        <article data-xh-part="item" item-id="m5" item-index="4" item-role="assistant">第 5 条消息。</article>
        <article data-xh-part="item" item-id="m6" item-index="5" item-role="assistant">第 6 条消息。</article>
        <article data-xh-part="item" item-id="m7" item-index="6" item-role="assistant">第 7 条消息。</article>
        <article data-xh-part="item" item-id="m8" item-index="7" item-role="assistant">第 8 条消息。</article>
      </div>
    </div>
    <button data-xh-part="scroll-to-end-trigger">
      <!-- 条数由元素写入 -->
      <span data-xh-part="unread-count"></span>
    </button>
  </div>
</xh-message-feed>

<script type="module">
  // 消息由宿主追加，元素不替作者生成节点
  const feed = document.getElementById("message-feed-unread");
  const list = feed.querySelector('[data-xh-part="list"]');

  let n = 8;
  const tick = () => {
    // 元素被移出文档就收手，别让定时器在卸载后继续跑
    if (!feed.isConnected) return;
    n += 1;
    const item = document.createElement("article");
    item.setAttribute("data-xh-part", "item");
    item.setAttribute("item-id", \`m\${n}\`);
    item.setAttribute("item-index", String(n - 1));
    item.setAttribute("item-role", "assistant");
    item.textContent = \`第 \${n} 条消息。\`;
    list.appendChild(item);
    feed.setAttribute("count", String(n));
    if (n < 30) setTimeout(tick, 2000);
  };
  setTimeout(tick, 2000);
<\/script>
`;export{e as default};