var e=`<!-- 计时与暂停 | duration 结束后自动退场；指针停在卡片上或焦点进入卡片内都会暂停计时，离开后继续剩余部分；单条卡片也可以单独摆放 -->
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="notification-pause-slot"></div>
  <xh-button id="notification-pause-again" size="sm" variant="outline">
    <button data-xh-part="root">重新计时</button>
  </xh-button>
</div>

<template id="notification-pause-template">
  <xh-notification-item preset="toast" title="6 秒后自动收走" duration="6000">
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-content">
        <div data-xh-part="item-title"></div>
        <span data-readout style="font-size: 12px; opacity: 0.75"></span>
      </div>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const slot = document.getElementById("notification-pause-slot");
  const template = document.getElementById("notification-pause-template");
  let watcher;

  // 生命周期与暂停态都写在卡片上，照它回显
  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);

    const item = node.querySelector('[data-xh-part="item"]');
    const readout = node.querySelector("[data-readout]");
    const paint = () => {
      const paused = item.hasAttribute("data-paused");
      readout.textContent = \`状态：\${item.dataset.state ?? ""} · \${
        paused ? "计时已按住" : "计时在走"
      }\`;
    };

    watcher?.disconnect();
    watcher = new MutationObserver(paint);
    watcher.observe(item, {
      attributes: true,
      attributeFilter: ["data-state", "data-paused"],
    });
    paint();
  }

  mount();
  document.getElementById("notification-pause-again").addEventListener("click", mount);
<\/script>
`;export{e as default};