const n=`<!-- 只要一颗按钮 | 必备部件只有 root 与 trigger：文本已经在页面上时，展示框与标题都可以省掉 -->
<code style="font-size: 13px">pnpm add @xihan-ui/web-components @xihan-ui/styles</code>
<xh-clipboard
  value="pnpm add @xihan-ui/web-components @xihan-ui/styles"
  timeout="1500"
>
  <div data-xh-part="root">
    <button data-xh-part="trigger">
      <span data-xh-part="indicator">复制安装命令</span>
      <span data-xh-part="indicator" copied>已复制</span>
    </button>
  </div>
</xh-clipboard>
`;export{n as default};
