const t=`<!-- 逐条落位 | 单条通知自带 placement 就盖掉 toaster 的默认落位；placements 报出眼下有条目的位置，一个位置一摞 -->
<xh-toaster id="toaster-spots" duration="8000">
  <div data-xh-part="root">
    <xh-button size="sm" variant="outline" data-spot="top-start" data-label="左上">
      <button data-xh-part="root">弹到左上</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-spot="top-end" data-label="右上">
      <button data-xh-part="root">弹到右上</button>
    </xh-button>
    <xh-button size="sm" variant="outline" data-spot="bottom" data-label="正下">
      <button data-xh-part="root">弹到正下</button>
    </xh-button>
    <span>眼下有条目的位置：<span id="toaster-spots-list">（无）</span></span>

    <!-- 一个位置一摞，group 自带 placement 声明自己是哪一个 -->
    <div data-xh-part="group" placement="top-start"></div>
    <div data-xh-part="group" placement="top-end"></div>
    <div data-xh-part="group" placement="bottom"></div>
  </div>
</xh-toaster>

<template id="toaster-spots-template">
  <xh-toast>
    <div data-xh-part="root">
      <div data-xh-part="title"></div>
      <div data-xh-part="description"></div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </xh-toast>
</template>

<script type="module">
  const toaster = document.getElementById("toaster-spots");
  const groups = [...toaster.querySelectorAll('[data-xh-part="group"]')];
  const template = document.getElementById("toaster-spots-template");
  const list = document.getElementById("toaster-spots-list");
  const translations = { close: "关闭" };

  // 每一摞各按自己的位置取条目，各排各的队
  function render() {
    for (const group of groups) {
      const toasts = toaster.getToastsByPlacement(group.getAttribute("placement"));
      const alive = new Set(toasts.map((toast) => toast.id));
      for (const node of [...group.children]) {
        if (!alive.has(node.toastId)) {
          node.remove();
        }
      }
      for (const toast of toasts) {
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
    }
    list.textContent = toaster.placements.join("、") || "（无）";
  }

  toaster.addEventListener("toasts-change", render);

  for (const button of toaster.querySelectorAll("[data-spot]")) {
    button.addEventListener("click", () => {
      toaster.create({
        placement: button.dataset.spot,
        title: \`落在\${button.dataset.label}\`,
        description: "每个位置各排各的队，互不挤占",
      });
    });
  }
<\/script>
`;export{t as default};
