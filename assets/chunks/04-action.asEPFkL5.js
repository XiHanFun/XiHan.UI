const t=`<!-- 操作按钮 | action-trigger 按下时先发 action 事件，再使该条进入退场；closable 决定是否保留关闭按钮 -->
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="toast-action-slot"></div>
  <div style="display: flex; align-items: center; gap: 12px">
    <xh-button id="toast-action-again" size="sm" variant="outline">
      <button data-xh-part="root">再挂一条</button>
    </xh-button>
    <span id="toast-action-log">（还没点）</span>
  </div>
</div>

<template id="toast-action-template">
  <xh-toast
    id="toast-demo-action"
    title="已删除 1 个文件"
    duration="0"
  >
    <div data-xh-part="root">
      <span data-xh-part="indicator"></span>
      <div data-xh-part="content"><div data-xh-part="title"></div></div>
      <button data-xh-part="action-trigger">撤销</button>
      <button data-xh-part="close-trigger"></button>
    </div>
  </xh-toast>
</template>

<script type="module">
  const slot = document.getElementById("toast-action-slot");
  const template = document.getElementById("toast-action-template");
  const log = document.getElementById("toast-action-log");

  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);
  }

  // action 带的是这条轻提示的身份，从容器上接冒泡上来的那一份
  slot.addEventListener("action", (event) => {
    log.textContent = \`撤销了：\${event.detail.id}\`;
  });

  mount();
  document.getElementById("toast-action-again").addEventListener("click", mount);
<\/script>
`;export{t as default};
