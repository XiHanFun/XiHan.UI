const t=`<!-- 补充说明 | description 提供一行简短上下文；需要长时间阅读的内容改用 Notification -->
<xh-toast
  tone="success"
  title="文件已上传"
  description="可在项目资源中继续查看"
  duration="0"
>
  <div data-xh-part="root">
    <span data-xh-part="indicator"></span>
    <div data-xh-part="content">
      <div data-xh-part="title"></div>
      <div data-xh-part="description"></div>
    </div>
    <button data-xh-part="close-trigger"></button>
  </div>
</xh-toast>

<script type="module">
  document.querySelector("xh-toast").translations = { close: "关闭" };
<\/script>
`;export{t as default};
