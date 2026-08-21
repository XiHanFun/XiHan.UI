const t=`<!-- 基础用法 | create 入队并返回 id，队列里的每条由作者渲染成一条通知；退场窗口走完只收起不删，宿主在 status-change 里把它移出队列 -->
<xh-toaster id="toaster-basic">
  <div data-xh-part="root">
    <xh-button variant="solid" data-create="save">
      <button data-xh-part="root">弹一条</button>
    </xh-button>
    <xh-button variant="outline" data-create="error">
      <button data-xh-part="root">弹一条 error</button>
    </xh-button>
    <span>队列：<span id="toaster-basic-count">0</span> 条</span>

    <div data-xh-part="group"></div>
  </div>
</xh-toaster>

<!-- 单条通知的节点归作者，元素不替作者生成，模板照队列克隆 -->
<template id="toaster-basic-template">
  <xh-toast>
    <div data-xh-part="root">
      <div data-xh-part="title"></div>
      <div data-xh-part="description"></div>
      <button data-xh-part="close-trigger">✕</button>
    </div>
  </xh-toast>
</template>

<script type="module">
  const toaster = document.getElementById("toaster-basic");
  const group = toaster.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("toaster-basic-template");
  const count = document.getElementById("toaster-basic-count");
  const translations = { close: "关闭" };

  // 队列变了就把这一摞重铺一遍：没了的摘掉，新来的克隆一条，剩下的把文案摊上去
  function render() {
    const list = toaster.visibleToasts;
    const alive = new Set(list.map((toast) => toast.id));
    for (const node of [...group.children]) {
      if (!alive.has(node.toastId)) {
        node.remove();
      }
    }
    for (const toast of list) {
      let node = [...group.children].find((el) => el.toastId === toast.id);
      if (!node) {
        node = document.importNode(template.content.firstElementChild, true);
        node.toastId = toast.id;
        node.translations = translations;
        group.append(node);
      }
      node.titleText = toast.title;
      node.description = toast.description;
      node.type = toast.type;
      node.duration = toast.duration;
      node.removeDelay = toast.removeDelay;
      node.closable = toast.closable;
    }
    count.textContent = String(toaster.count);
  }

  toaster.addEventListener("toasts-change", render);

  const messages = {
    save: { title: "草稿已保存", description: "内容已同步到云端" },
    error: {
      type: "error",
      title: "同步失败",
      description: "网络中断，稍后自动重试",
    },
  };

  for (const button of toaster.querySelectorAll("[data-create]")) {
    button.addEventListener("click", () =>
      toaster.create(messages[button.dataset.create])
    );
  }
<\/script>
`;export{t as default};
