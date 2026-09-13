const t=`<!-- 基础用法 | 拖动任务调整顺序 -->
<style>
  #sortable-basic [data-xh-part="item"] { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-sortable id="sortable-basic" ids="规划,设计,实现,发布" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(360px, 100%)">
    <div data-xh-part="item" item-id="规划"><button data-xh-part="item-drag-trigger" item-id="规划"></button><span>规划</span></div>
    <div data-xh-part="item" item-id="设计"><button data-xh-part="item-drag-trigger" item-id="设计"></button><span>设计</span></div>
    <div data-xh-part="item" item-id="实现"><button data-xh-part="item-drag-trigger" item-id="实现"></button><span>实现</span></div>
    <div data-xh-part="item" item-id="发布"><button data-xh-part="item-drag-trigger" item-id="发布"></button><span>发布</span></div>
    <div data-xh-part="drop-indicator"></div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const host = document.getElementById("sortable-basic");
  const root = host.querySelector('[data-xh-part="root"]');
  host.addEventListener("sort", (event) => {
    host.ids = event.detail.ids;
    for (const id of event.detail.ids) root.insertBefore(root.querySelector(\`[item-id="\${id}"]\`), root.querySelector('[data-xh-part="drop-indicator"]'));
  });
<\/script>
`;export{t as default};
