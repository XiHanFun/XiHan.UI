const t=`<!-- 上限与清空 | max 限制每个位置同时显示几条，超出挤掉最旧的；dismissAll 把队列直接倒掉，不走退场窗口 -->
<xh-toaster id="toaster-max" max="3" gap="12" duration="20000">
  <div data-xh-part="root">
    <xh-button variant="solid" data-create>
      <button data-xh-part="root">连着弹</button>
    </xh-button>
    <xh-button variant="ghost" data-clear>
      <button data-xh-part="root">全部清空</button>
    </xh-button>
    <span>队列：<span id="toaster-max-count">0</span> 条（上限 3）</span>

    <div data-xh-part="group"></div>
  </div>
</xh-toaster>

<template id="toaster-max-template">
  <xh-toast>
    <div data-xh-part="root">
      <div data-xh-part="title"></div>
      <div data-xh-part="description"></div>
      <button data-xh-part="close-trigger">✕</button>
    </div>
  </xh-toast>
</template>

<script type="module">
  const toaster = document.getElementById("toaster-max");
  const group = toaster.querySelector('[data-xh-part="group"]');
  const template = document.getElementById("toaster-max-template");
  const count = document.getElementById("toaster-max-count");
  const translations = { close: "关闭" };
  let seq = 0;

  // 队列变了就把这一摞重铺一遍；被挤掉的那条随之摘走
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

  toaster.querySelector("[data-create]").addEventListener("click", () => {
    seq += 1;
    toaster.create({
      title: \`第 \${seq} 条通知\`,
      description: "连按几下看最旧的被挤掉",
    });
  });

  toaster.querySelector("[data-clear]").addEventListener("click", () => {
    toaster.dismissAll();
  });
<\/script>
`;export{t as default};
