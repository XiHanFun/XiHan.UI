const t=`<!-- 垂直布局 | 按纵向排列工具 -->
<xh-toolbar orientation="vertical">
  <div data-xh-part="root" aria-label="画布缩放">
    <button data-xh-part="item" type="button" value="zoom-in">
      <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/><path d="M11 8V14M8 11H14"/></svg>
      放大
    </button>
    <button data-xh-part="item" type="button" value="zoom-out">
      <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20L16 16"/><path d="M8 11H14"/></svg>
      缩小
    </button>
    <div data-xh-part="separator"></div>
    <button data-xh-part="item" type="button" value="fit">
      <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3V8M16 3H21V8M8 21H3V16M16 21H21V16"/></svg>
      适应画布
    </button>
  </div>
</xh-toolbar>
`;export{t as default};
