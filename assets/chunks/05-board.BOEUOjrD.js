const a=`<!-- 看板 | 在几列之间移动任务 -->
<style>
  #sortable-board { display: flex; flex-wrap: wrap; align-items: flex-start; gap: var(--xh-space-4); }
  #sortable-board section { flex: 1 1 160px; display: grid; gap: var(--xh-space-2); padding: var(--xh-space-3); border: var(--xh-stroke-thin) solid var(--xh-border-default); border-radius: var(--xh-shape-surface); }
  #sortable-board h4 { margin: 0; font-size: var(--xh-text-label-size); }
  #sortable-board [data-xh-part="root"] { min-block-size: var(--xh-control-h-lg); }
  #sortable-board [data-xh-part="item"] { display: flex; align-items: center; gap: var(--xh-space-2); padding: var(--xh-space-2) var(--xh-space-3); border-radius: var(--xh-shape-control); background: var(--xh-bg-subtle); }
</style>
<div id="sortable-board">
  <section>
    <h4 id="sortable-board-todo">待办</h4>
    <xh-sortable ids="调研,原型,评审" group="board" list-id="todo" style="display: contents">
      <div data-xh-part="root" aria-labelledby="sortable-board-todo">
        <div data-xh-part="item" item-id="调研" aria-label="调研"><button data-xh-part="item-drag-trigger" item-id="调研"></button><span data-demo-block="line" data-tone="brand"></span></div>
        <div data-xh-part="item" item-id="原型" aria-label="原型"><button data-xh-part="item-drag-trigger" item-id="原型"></button><span data-demo-block="line" data-tone="info"></span></div>
        <div data-xh-part="item" item-id="评审" aria-label="评审"><button data-xh-part="item-drag-trigger" item-id="评审"></button><span data-demo-block="line" data-tone="warning"></span></div>
        <div data-xh-part="drop-indicator"></div>
        <div data-xh-part="live-region"></div>
      </div>
    </xh-sortable>
  </section>
  <section>
    <h4 id="sortable-board-doing">进行中</h4>
    <xh-sortable ids="接口,联调" group="board" list-id="doing" style="display: contents">
      <div data-xh-part="root" aria-labelledby="sortable-board-doing">
        <div data-xh-part="item" item-id="接口" aria-label="接口"><button data-xh-part="item-drag-trigger" item-id="接口"></button><span data-demo-block="line" data-tone="success"></span></div>
        <div data-xh-part="item" item-id="联调" aria-label="联调"><button data-xh-part="item-drag-trigger" item-id="联调"></button><span data-demo-block="line" data-tone="danger"></span></div>
        <div data-xh-part="drop-indicator"></div>
        <div data-xh-part="live-region"></div>
      </div>
    </xh-sortable>
  </section>
  <section>
    <h4 id="sortable-board-done">已完成</h4>
    <xh-sortable ids="立项" group="board" list-id="done" style="display: contents">
      <div data-xh-part="root" aria-labelledby="sortable-board-done">
        <div data-xh-part="item" item-id="立项" aria-label="立项"><button data-xh-part="item-drag-trigger" item-id="立项"></button><span data-demo-block="line" data-tone="neutral"></span></div>
        <div data-xh-part="drop-indicator"></div>
        <div data-xh-part="live-region"></div>
      </div>
    </xh-sortable>
  </section>
</div>
<script type="module">
  const board = document.getElementById("sortable-board");
  const hostOf = listId => board.querySelector(\`xh-sortable[list-id="\${listId}"]\`);
  // 按新顺序把项节点排进这一列的 root：落点线与播报区留在末尾
  function place(host, ids) {
    const root = host.querySelector('[data-xh-part="root"]');
    for (const id of ids) root.insertBefore(board.querySelector(\`[data-xh-part="item"][item-id="\${id}"]\`), root.querySelector('[data-xh-part="drop-indicator"]'));
    host.ids = ids;
  }
  board.addEventListener("sort", event => place(event.target, event.detail.ids));
  // 落进别的列时源列表发一次 transfer：两列的新顺序都算好了，照着把节点挪过去、写回 ids
  board.addEventListener("transfer", (event) => {
    const { fromList, toList, fromIds, toIds } = event.detail;
    place(hostOf(toList), toIds);
    place(hostOf(fromList), fromIds);
  });
<\/script>
`;export{a as default};
