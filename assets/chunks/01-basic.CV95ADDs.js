const t=`<!-- 基础用法 | 集中常用编辑操作 -->
<xh-toolbar>
  <div data-xh-part="root" aria-label="文本编辑">
    <div data-xh-part="group">
      <button data-format data-xh-part="item" type="button" value="bold" aria-label="加粗" aria-pressed="true">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 5H13A4 4 0 0 1 13 13H7Z"/><path d="M7 13H14A4 4 0 0 1 14 21H7Z"/></svg>
      </button>
      <div data-xh-part="separator"></div>
      <button data-format data-xh-part="item" type="button" value="italic" aria-label="斜体" aria-pressed="false">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
      </button>
      <div data-xh-part="separator"></div>
      <button data-format data-xh-part="item" type="button" value="underline" aria-label="下划线" aria-pressed="false">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 4V11A6 6 0 0 0 18 11V4"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
      </button>
    </div>
    <div data-xh-part="group">
      <button data-xh-part="item" type="button" value="copy" aria-label="复制">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      </button>
      <div data-xh-part="separator"></div>
      <button data-xh-part="item" type="button" value="paste" aria-label="粘贴">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/></svg>
      </button>
    </div>
  </div>
</xh-toolbar>

<script type="module">
  for (const item of document.querySelectorAll("[data-format]")) {
    item.addEventListener("click", () => {
      item.setAttribute("aria-pressed", String(item.getAttribute("aria-pressed") !== "true"));
    });
  }
<\/script>
`;export{t as default};
