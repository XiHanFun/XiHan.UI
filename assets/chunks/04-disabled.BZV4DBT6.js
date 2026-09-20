const t=`<!-- 禁用项目 | 固定单个项目的位置 -->
<style>
  #sortable-disabled [data-xh-part="item"] { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-radius: var(--xh-shape-surface); background: var(--xh-bg-subtle); }
</style>
<xh-sortable id="sortable-disabled" ids="固定项,设计,实现,发布" style="display: contents">
  <div data-xh-part="root" style="inline-size: min(360px, 100%)">
    <div data-xh-part="item" item-id="固定项" disabled aria-label="固定项"><button data-xh-part="item-drag-trigger" item-id="固定项" disabled></button><span data-demo-block="line" data-tone="neutral"></span></div>
    <div data-xh-part="item" item-id="设计" aria-label="设计"><button data-xh-part="item-drag-trigger" item-id="设计"></button><span data-demo-block="line" data-tone="info"></span></div>
    <div data-xh-part="item" item-id="实现" aria-label="实现"><button data-xh-part="item-drag-trigger" item-id="实现"></button><span data-demo-block="line" data-tone="success"></span></div>
    <div data-xh-part="item" item-id="发布" aria-label="发布"><button data-xh-part="item-drag-trigger" item-id="发布"></button><span data-demo-block="line" data-tone="warning"></span></div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const host = document.getElementById("sortable-disabled");
  const root = host.querySelector('[data-xh-part="root"]');
  host.addEventListener("sort", (event) => {
    host.ids = event.detail.ids;
    for (const id of event.detail.ids) root.insertBefore(root.querySelector(\`[data-xh-part="item"][item-id="\${id}"]\`), root.querySelector('[data-xh-part="live-region"]'));
  });
<\/script>
`;export{t as default};
