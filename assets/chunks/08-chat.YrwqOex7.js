const e=`<!-- 聊天流 | anchor 设为 end：从最新一条看起，贴底时新消息继续贴底；往前翻出历史时，给了 getItemKey 视口不跳 -->
<div style="display: grid; gap: 8px; inline-size: 100%; max-inline-size: 420px">
  <div style="display: flex; gap: 8px">
    <xh-button id="virtualizer-chat-older" size="sm" variant="outline">
      <button data-xh-part="root" type="button">加载更早</button>
    </xh-button>
    <xh-button id="virtualizer-chat-send" size="sm">
      <button data-xh-part="root" type="button">发送一条</button>
    </xh-button>
  </div>
  <xh-virtualizer id="virtualizer-chat" estimate-size="36" anchor="end">
    <div data-xh-part="root" style="block-size: 240px">
      <div data-xh-part="viewport">
        <div data-xh-part="content"></div>
      </div>
    </div>
  </xh-virtualizer>
</div>

<script type="module">
  const host = document.getElementById("virtualizer-chat");
  const content = host.querySelector('[data-xh-part="content"]');
  let oldest = 0;
  let newest = 30;
  let messages = Array.from({ length: 30 }, (_, id) => ({ id, text: \`消息 \${id}\` }));
  // 节点按消息 id 复用：下标会随往前插入整体后移，身份不会
  const nodes = new Map();

  function render(items) {
    const live = new Set();
    for (const item of items) {
      const message = messages[item.index];
      live.add(message.id);
      let el = nodes.get(message.id);
      if (!el) {
        el = document.createElement("div");
        el.dataset.xhPart = "item";
        el.style.cssText = "display: flex; align-items: center; height: 36px; padding-inline: 12px; border-block-end: 1px solid var(--xh-border-subtle)";
        el.textContent = message.text;
        nodes.set(message.id, el);
        content.append(el);
      }
      el.setAttribute("value", String(item.index));
    }
    for (const [id, el] of nodes) {
      if (live.has(id)) continue;
      el.remove();
      nodes.delete(id);
    }
  }

  function sync() {
    host.getItemKey = index => messages[index].id;
    host.count = messages.length;
  }

  sync();
  host.addEventListener("range-change", event => render(event.detail.virtualItems));
  document.getElementById("virtualizer-chat-older").addEventListener("click", () => {
    const older = Array.from({ length: 20 }, () => {
      oldest -= 1;
      return { id: oldest, text: \`历史 \${-oldest}\` };
    }).reverse();
    messages = [...older, ...messages];
    sync();
  });
  document.getElementById("virtualizer-chat-send").addEventListener("click", () => {
    messages = [...messages, { id: newest, text: \`消息 \${newest++}\` }];
    sync();
  });
<\/script>
`;export{e as default};
