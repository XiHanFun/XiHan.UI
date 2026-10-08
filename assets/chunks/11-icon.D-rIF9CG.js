var e=`<!-- 图标 | 条目文字前放一枚图标：图标对读屏隐藏，可及名仍是文字；直径与颜色随条目走，选中与悬停一并换色 -->
<xh-radio-group variant="segmented" default-value="list">
  <div data-xh-part="root">
    <span data-xh-part="label">视图</span>
    <span data-xh-part="thumb"></span>
    <div data-xh-part="item" value="list">
      <span data-xh-part="item-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="5" cy="6" r="1"></circle><circle cx="5" cy="12" r="1"></circle><circle cx="5" cy="18" r="1"></circle>
          <path d="M11 6h9"></path><path d="M11 12h9"></path><path d="M11 18h9"></path>
        </svg>
      </span>
      <span data-xh-part="item-text">列表</span>
    </div>
    <div data-xh-part="item" value="grid">
      <span data-xh-part="item-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1"></rect><rect x="14" y="3" width="7" height="7" rx="1"></rect>
          <rect x="3" y="14" width="7" height="7" rx="1"></rect><rect x="14" y="14" width="7" height="7" rx="1"></rect>
        </svg>
      </span>
      <span data-xh-part="item-text">网格</span>
    </div>
  </div>
</xh-radio-group>
`;export{e as default};