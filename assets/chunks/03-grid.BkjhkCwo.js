const t=`<!-- 网格排序 | 在换行布局中排序 -->
<style>
  #sortable-grid [data-xh-part="item"] { display: flex; align-items: center; gap: 6px; inline-size: 104px; block-size: 72px; padding: 10px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-sortable id="sortable-grid" ids="颜色,排版,间距,圆角,阴影,动效" orientation="both" style="display: contents">
  <div data-xh-part="root" style="max-inline-size: 340px">
    <div data-xh-part="item" item-id="颜色"><button data-xh-part="item-drag-trigger" item-id="颜色"></button><span>颜色</span></div>
    <div data-xh-part="item" item-id="排版"><button data-xh-part="item-drag-trigger" item-id="排版"></button><span>排版</span></div>
    <div data-xh-part="item" item-id="间距"><button data-xh-part="item-drag-trigger" item-id="间距"></button><span>间距</span></div>
    <div data-xh-part="item" item-id="圆角"><button data-xh-part="item-drag-trigger" item-id="圆角"></button><span>圆角</span></div>
    <div data-xh-part="item" item-id="阴影"><button data-xh-part="item-drag-trigger" item-id="阴影"></button><span>阴影</span></div>
    <div data-xh-part="item" item-id="动效"><button data-xh-part="item-drag-trigger" item-id="动效"></button><span>动效</span></div>
    <div data-xh-part="drop-indicator"></div><div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const host = document.getElementById("sortable-grid");
  const root = host.querySelector('[data-xh-part="root"]');
  host.addEventListener("sort", (event) => {
    host.ids = event.detail.ids;
    for (const id of event.detail.ids) root.insertBefore(root.querySelector(\`[data-xh-part="item"][item-id="\${id}"]\`), root.querySelector('[data-xh-part="drop-indicator"]'));
  });
<\/script>
`;export{t as default};
