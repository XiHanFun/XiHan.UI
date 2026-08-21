const n=`<!-- 图标 | icon 部件排在标题前面，颜色取当前语气的强调色；内容由作者塞，字形与内联 svg 都行 -->
<div style="width: 100%; display: grid; gap: 12px">
  <!-- 一个字形就够：图标是纯装饰，读屏不会念它 -->
  <xh-alert tone="success">
    <div data-xh-part="root">
      <span data-xh-part="icon">✓</span>
      <div data-xh-part="title">发布完成</div>
      <div data-xh-part="description">三个节点都已切到新版本。</div>
    </div>
  </xh-alert>

  <!-- 内联 svg 同样能塞进来，描边取 currentColor 就跟着语气走 -->
  <xh-alert tone="danger">
    <div data-xh-part="root">
      <span data-xh-part="icon">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 3.5L21.5 20H2.5Z" />
          <path d="M12 9.5v4" />
          <path d="M12 16.5v.5" />
        </svg>
      </span>
      <div data-xh-part="title">发布失败</div>
      <div data-xh-part="description">第 2 个节点健康检查未通过。</div>
    </div>
  </xh-alert>
</div>
`;export{n as default};
