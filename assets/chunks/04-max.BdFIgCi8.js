const t=`<!-- 上限与清空 | max 限制每个位置同时显示几条，超出挤掉最旧的；dismissAll 把队列直接倒掉，不走退场窗口 -->
<xh-notification id="notification-max" max="3" gap="12" duration="20000">
  <div data-xh-part="root">
    <xh-button variant="solid" data-create>
      <button data-xh-part="root">连着弹</button>
    </xh-button>
    <xh-button variant="ghost" data-clear>
      <button data-xh-part="root">全部清空</button>
    </xh-button>
    <span>队列：<span id="notification-max-count">0</span> 条（上限 3）</span>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-max-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-title"></div>
      <div data-xh-part="item-description"></div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-max");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-max-template");
  const count = document.getElementById("notification-max-count");
  const translations = { close: "关闭" };
  let seq = 0;

  // 队列变了就把这一摞重铺一遍；被挤掉的那条随之摘走
  function render() {
    const list = notification.visibleNotifications;
    const alive = new Set(list.map((item) => item.id));
    for (const node of [...group.children]) {
      if (!alive.has(node.itemId)) {
        node.remove();
      }
    }
    for (const item of list) {
      let node = [...group.children].find((el) => el.itemId === item.id);
      if (!node) {
        node = document.importNode(template.content.firstElementChild, true);
        node.itemId = item.id;
        node.translations = translations;
        group.append(node);
      }
      node.titleText = item.title;
      node.description = item.description;
      node.type = item.type;
      node.duration = item.duration;
      node.removeDelay = item.removeDelay;
      node.closable = item.closable;
    }
    count.textContent = String(notification.count);
  }

  notification.addEventListener("items-change", render);

  notification.querySelector("[data-create]").addEventListener("click", () => {
    seq += 1;
    notification.create({
      title: \`第 \${seq} 条通知\`,
      description: "连按几下看最旧的被挤掉",
    });
  });

  notification.querySelector("[data-clear]").addEventListener("click", () => {
    notification.dismissAll();
  });
<\/script>
`;export{t as default};
