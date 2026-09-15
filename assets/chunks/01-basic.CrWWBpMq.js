const t=`<!-- 基础用法 | 默认由状态图标、文本列和悬停显示的关闭按钮组成；duration 给 0 即不自动消失 -->
<div style="display: grid; width: 100%; gap: 12px; justify-items: center">
  <div id="toast-basic-slot"></div>
  <xh-button id="toast-basic-again" size="sm" variant="outline">
    <button data-xh-part="root">再挂一条</button>
  </xh-button>
</div>

<template id="toast-basic-template">
  <xh-toast title="草稿已保存" duration="0">
    <div data-xh-part="root">
      <span data-xh-part="indicator"></span>
      <div data-xh-part="content"><div data-xh-part="title"></div></div>
      <button data-xh-part="close-trigger"></button>
    </div>
  </xh-toast>
</template>

<script type="module">
  const slot = document.getElementById("toast-basic-slot");
  const template = document.getElementById("toast-basic-template");

  // 关掉之后换一条新的挂上去，方便反复看
  function mount() {
    const node = document.importNode(template.content.firstElementChild, true);
    // 文案是对象，只走 property
    node.translations = { close: "关闭" };
    slot.replaceChildren(node);
  }

  mount();
  document.getElementById("toast-basic-again").addEventListener("click", mount);
<\/script>
`;export{t as default};
