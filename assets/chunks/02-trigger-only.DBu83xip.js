const t=`<!-- 独立按钮 | 内容已在页面中展示时，只保留复制按钮 -->
<xh-clipboard value="https://xihan.dev">
  <div data-xh-part="root">
    <button data-xh-part="copy-trigger">
      <span data-xh-part="indicator"><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2.5" width="8" height="4" rx="1"/><path d="M16 4.5h1.5a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2H8"/></svg> 复制链接</span>
      <span data-xh-part="indicator" copied><svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12.5L9.5 18L20 6"/></svg> 已复制</span>
    </button>
  </div>
</xh-clipboard>
`;export{t as default};
