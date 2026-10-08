var e=`<!-- 操作按钮 | item-action-trigger 按下时先发 action 事件，再使该条进入退场；破坏性操作配“撤销”优于事前确认 -->
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="notification-action-slot"></div>
  <div style="display: flex; align-items: center; gap: 12px">
    <xh-button id="notification-action-again" size="sm" variant="outline">
      <button data-xh-part="root">再挂一条</button>
    </xh-button>
    <span id="notification-action-log">（还没点）</span>
  </div>
</div>

<template id="notification-action-template">
  <xh-notification-item
    id="notification-demo-action"
    preset="toast"
    title="已删除 1 个文件"
    duration="0"
  >
    <div data-xh-part="item">
      <span data-xh-part="item-indicator"></span>
      <div data-xh-part="item-content"><div data-xh-part="item-title"></div></div>
      <button data-xh-part="item-action-trigger">撤销</button>
      <button data-xh-part="item-close-trigger"></button>
    </div>
  </xh-notification-item>
</template>

<script type="module">
  const slot = document.getElementById("notification-action-slot");
  const template = document.getElementById("notification-action-template");
  const log = document.getElementById("notification-action-log");

  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);
  }

  // action 带的是这张卡片的身份，从容器上接冒泡上来的那一份
  slot.addEventListener("action", (event) => {
    log.textContent = \`撤销了：\${event.detail.id}\`;
  });

  mount();
  document.getElementById("notification-action-again").addEventListener("click", mount);
<\/script>
`;export{e as default};