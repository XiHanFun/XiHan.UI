const t=`<!-- 就地改写 | 同一个 id 再 create 一次是原地改写而不是新弹一条，位置不动；loading 不自动消失，换成 success 才开始倒计时 -->
<xh-notification id="notification-update">
  <div data-xh-part="root">
    <xh-button variant="solid" data-start>
      <button data-xh-part="root">上传（loading → success）</button>
    </xh-button>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-update-template">
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
  const notification = document.getElementById("notification-update");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-update-template");
  const translations = { close: "关闭" };

  // 队列变了就把这一摞重铺一遍；同一条 id 命中已有节点，位置不动
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
  }

  notification.addEventListener("items-change", render);

  notification.querySelector("[data-start]").addEventListener("click", () => {
    notification.create({
      id: "upload",
      type: "loading",
      title: "正在上传",
      description: "3 个文件排队中",
    });
    // 改一条已经在队列里的
    window.setTimeout(() => {
      notification.updateItem("upload", { description: "已传 2 / 3" });
    }, 1200);
    // 同一个 id 再 create 一次同样是就地改写
    window.setTimeout(() => {
      notification.create({
        id: "upload",
        type: "success",
        title: "上传完成",
        description: "3 个文件已入库",
      });
    }, 2400);
  });
<\/script>
`;export{t as default};
