const a=`<!-- 读屏文案 | root 是 nav 地标，translations.root 换掉它的 aria-label，同页有多个地标时靠它区分 -->
<xh-breadcrumb id="breadcrumb-translations">
  <nav data-xh-part="root">
    <ol data-xh-part="list">
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/blog">博客</a>
      </li>
      <li data-xh-part="separator">/</li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/blog/2026">2026</a>
      </li>
      <li data-xh-part="separator">/</li>
      <li data-xh-part="item">
        <a data-xh-part="link" href="#/blog/2026/design-system" current>
          设计系统运行时
        </a>
      </li>
    </ol>
  </nav>
</xh-breadcrumb>

<script type="module">
  // 文案是对象，只走 property
  document.getElementById("breadcrumb-translations").translations = {
    root: "文章位置",
  };
<\/script>
`;export{a as default};
