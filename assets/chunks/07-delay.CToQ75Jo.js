var e=`<!-- 延迟露面 | delay 让转圈挂载后等一段时间才出现：快请求在这之前就回来，转圈从头到尾不露面，不会闪一下 -->
<div id="spinner-delay" style="display: grid; gap: 12px; justify-items: start">
  <div style="display: flex; gap: 8px">
    <xh-button variant="outline" data-ms="200">
      <button data-xh-part="root">快请求（200 ms）</button>
    </xh-button>
    <xh-button variant="outline" data-ms="1500">
      <button data-xh-part="root">慢请求（1.5 s）</button>
    </xh-button>
  </div>
  <span data-slot="result"></span>
</div>

<!-- delay 从元素连上文档那一刻算起：每次请求现挂一个，回来就撤掉 -->
<template id="spinner-delay-template">
  <xh-spinner delay="400" label="正在查询">
    <span data-xh-part="root">
      <span data-xh-part="label"></span>
    </span>
  </xh-spinner>
</template>

<script type="module">
  const demo = document.getElementById("spinner-delay");
  const template = document.getElementById("spinner-delay-template");
  const result = demo.querySelector('[data-slot="result"]');
  const buttons = [...demo.querySelectorAll("xh-button")];

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const ms = Number(button.dataset.ms);
      const spinner = document.importNode(template.content.firstElementChild, true);
      for (const each of buttons) each.disabled = true;
      result.textContent = "";
      result.before(spinner);
      window.setTimeout(() => {
        spinner.remove();
        for (const each of buttons) each.disabled = false;
        result.textContent = \`用时 \${ms} ms，查询完成\`;
      }, ms);
    });
  }
<\/script>
`;export{e as default};