var e=`<!-- 收进更多菜单 | 放不下的操作按次序收进行尾的更多按钮 -->
<div style="max-inline-size: 280px">
  <xh-toolbar>
    <div data-xh-part="root" aria-label="文本编辑">
      <div data-xh-part="group">
        <button data-format data-xh-part="item" type="button" value="bold" aria-label="加粗" aria-pressed="true">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 20V4h6a4 4 0 0 1 0 8H6"/><path d="M6 12h8a4 4 0 0 1 0 8H6"/></svg>
        </button>
        <button data-format data-xh-part="item" type="button" value="italic" aria-label="斜体" aria-pressed="false">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5h9"/><path d="M5 19h9"/><path d="M15 5L9 19"/></svg>
        </button>
        <button data-format data-xh-part="item" type="button" value="underline" aria-label="下划线" aria-pressed="false">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4v6a5 5 0 0 0 10 0V4"/><path d="M5 20h14"/></svg>
        </button>
      </div>
      <div data-xh-part="separator"></div>
      <div data-xh-part="group">
        <button data-align data-xh-part="item" type="button" value="left" aria-label="左对齐" aria-pressed="true">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h16"/><path d="M4 9.5h11"/><path d="M4 14.5h16"/><path d="M4 19.5h11"/></svg>
        </button>
        <button data-align data-xh-part="item" type="button" value="center" aria-label="居中" aria-pressed="false">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h16"/><path d="M6.5 9.5h11"/><path d="M4 14.5h16"/><path d="M6.5 19.5h11"/></svg>
        </button>
        <button data-align data-xh-part="item" type="button" value="right" aria-label="右对齐" aria-pressed="false">
          <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4.5h16"/><path d="M9 9.5h11"/><path d="M4 14.5h16"/><path d="M9 19.5h11"/></svg>
        </button>
      </div>
      <div data-xh-part="separator"></div>
      <button data-xh-part="item" type="button" value="link" aria-label="插入链接">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 7.5H8a4.5 4.5 0 0 0 0 9h2"/><path d="M14 7.5h2a4.5 4.5 0 0 1 0 9h-2"/><path d="M8.5 12h7"/></svg>
      </button>
      <button data-xh-part="item" type="button" value="image" aria-label="插入图片">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15L16 10L5 21"/></svg>
      </button>
      <button data-xh-part="item" type="button" value="quote" aria-label="引用">
        <svg aria-hidden="true" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 12H6a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 6 6h2.5A1.5 1.5 0 0 1 10 7.5V13c0 2.6-1.5 4.4-4 5"/><path d="M19.5 12h-4a1.5 1.5 0 0 1-1.5-1.5v-3A1.5 1.5 0 0 1 15.5 6H18a1.5 1.5 0 0 1 1.5 1.5V13c0 2.6-1.5 4.4-4 5"/></svg>
      </button>
      <button data-xh-part="overflow-trigger"></button>
    </div>
  </xh-toolbar>
</div>

<script type="module">
  for (const item of document.querySelectorAll("[data-format]")) {
    item.addEventListener("click", () => {
      item.setAttribute("aria-pressed", String(item.getAttribute("aria-pressed") !== "true"));
    });
  }
  const aligns = document.querySelectorAll("[data-align]");
  for (const item of aligns) {
    item.addEventListener("click", () => {
      for (const other of aligns)
        other.setAttribute("aria-pressed", String(other === item));
    });
  }
<\/script>
`;export{e as default};