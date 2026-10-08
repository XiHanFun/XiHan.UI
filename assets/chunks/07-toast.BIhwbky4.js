var e=`<!-- 轻提示预设 | preset="toast" 换成一句话的轻提示：落底部居中、最多 3 条、叠成一摞，鼠标或焦点进入即展开；卡片要把队列交下来的 preset 带上 -->
<xh-notification id="notification-toast" preset="toast">
  <div data-xh-part="root">
    <xh-button variant="solid" data-save>
      <button data-xh-part="root">保存</button>
    </xh-button>
    <xh-button variant="outline" data-create="success">
      <button data-xh-part="root">success</button>
    </xh-button>
    <xh-button variant="outline" data-create="warning">
      <button data-xh-part="root">warning</button>
    </xh-button>
    <xh-button variant="outline" data-create="danger">
      <button data-xh-part="root">danger</button>
    </xh-button>

    <div data-xh-part="group"></div>
  </div>
</xh-notification>

<template id="notification-toast-template">
  <xh-notification-item>
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <div data-xh-part="item-description"></div>
      </div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const notification = document.getElementById("notification-toast");
  const group = notification.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("notification-toast-template");
  const translations = { close: "关闭" };

  // 队列变了就把这一摞重铺一遍：没了的摘掉，新来的克隆一条，剩下的把文案摊上去
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
      node.preset = item.preset;
      node.titleText = item.title;
      node.description = item.description;
      node.tone = item.tone;
      node.loading = item.loading;
      node.duration = item.duration;
      node.closable = item.closable;
      node.pauseOnPageIdle = item.pauseOnPageIdle;
    }
  }

  notification.addEventListener("items-change", render);

  const messages = {
    success: { tone: "success", title: "已发布" },
    warning: { tone: "warning", title: "配额即将用尽" },
    danger: { tone: "danger", title: "同步失败" },
  };

  for (const button of notification.querySelectorAll("[data-create]")) {
    button.addEventListener("click", () =>
      notification.create(messages[button.dataset.create])
    );
  }

  // 加载中不自动消失，落定成 success 后才开始计时
  notification.querySelector("[data-save]").addEventListener("click", () => {
    const id = notification.create({ loading: true, title: "保存中" });
    window.setTimeout(() => {
      notification.updateItem(id, { loading: false, tone: "success", title: "已保存" });
    }, 900);
  });
<\/script>
`;export{e as default};