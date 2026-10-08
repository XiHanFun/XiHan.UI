var e=`<!-- 异步操作 | 点击后显示加载状态 -->
<xh-button id="button-loading-trigger">
  <button data-xh-part="root">
    <span data-xh-part="indicator"></span>
    <span data-xh-part="label">保存</span>
  </button>
</xh-button>

<script type="module">
  const button = document.getElementById("button-loading-trigger");
  button.addEventListener("click", async () => {
    button.loading = true;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    button.loading = false;
  });
<\/script>
`;export{e as default};