const n=`<!-- 手动收走 | create 返回的就是队列身份 id，存下来随时 dismiss 掉那一条；dismiss 直接移出队列，不走退场窗口 -->
<xh-notification id="notification-manual">
  <div data-xh-part="root">
    <xh-button variant="solid" data-start>
      <button data-xh-part="root">开始导出</button>
    </xh-button>
    <xh-button variant="outline" data-finish disabled>
      <button data-xh-part="root">手动收走</button>
    </xh-button>
    <span>
      队列：<span id="notification-manual-count">0</span> 条 · 记下的 id：<span
        id="notification-manual-id"
        >（无）</span
      >
    </span>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-manual-template">
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
  const notification = document.getElementById("notification-manual");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-manual-template");
  const count = document.getElementById("notification-manual-count");
  const idText = document.getElementById("notification-manual-id");
  const start = notification.querySelector("[data-start]");
  const finish = notification.querySelector("[data-finish]");
  const translations = { close: "关闭" };
  let pending = "";

  // 队列变了就把这一摞重铺一遍；记下的那条已经不在队列里就作废
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
    if (pending && !alive.has(pending)) {
      pending = "";
    }
    count.textContent = String(notification.count);
    idText.textContent = pending || "（无）";
    start.toggleAttribute("disabled", !!pending);
    finish.toggleAttribute("disabled", !pending);
  }

  notification.addEventListener("items-change", render);

  start.addEventListener("click", () => {
    pending = notification.create({
      type: "loading",
      title: "正在导出",
      description: "loading 不自动消失，等宿主来收",
    });
    render();
  });

  finish.addEventListener("click", () => {
    if (pending) {
      notification.dismiss(pending);
    }
  });
<\/script>
`;export{n as default};
