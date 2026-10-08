var e=`<!-- 可拖动 | GridList 负责选择和行内按钮，Sortable 负责指针与键盘重排 -->
<xh-sortable id="grid-list-sortable">
  <div data-xh-part="root" data-xh-part-owner="sortable">
    <xh-grid-list id="grid-list-sortable-list">
      <div data-xh-part="root" data-xh-part-owner="grid-list">
        <div data-xh-part="item" data-xh-part-owner="sortable" item-id="brief"><div data-xh-part="row" data-xh-part-owner="grid-list" value="brief"><div data-xh-part="row-content"><span data-xh-part="row-text">需求梳理</span></div><div data-xh-part="row-actions"><button data-xh-part="item-drag-trigger" data-xh-part-owner="sortable" item-id="brief"></button></div></div></div>
        <div data-xh-part="item" data-xh-part-owner="sortable" item-id="design"><div data-xh-part="row" data-xh-part-owner="grid-list" value="design"><div data-xh-part="row-content"><span data-xh-part="row-text">交互设计</span></div><div data-xh-part="row-actions"><button data-xh-part="item-drag-trigger" data-xh-part-owner="sortable" item-id="design"></button></div></div></div>
        <div data-xh-part="item" data-xh-part-owner="sortable" item-id="build"><div data-xh-part="row" data-xh-part-owner="grid-list" value="build"><div data-xh-part="row-content"><span data-xh-part="row-text">开发实现</span></div><div data-xh-part="row-actions"><button data-xh-part="item-drag-trigger" data-xh-part-owner="sortable" item-id="build"></button></div></div></div>
      </div>
    </xh-grid-list>
    <div data-xh-part="drop-indicator"></div>
    <div data-xh-part="live-region"></div>
  </div>
</xh-sortable>
<script type="module">
  const sortable = document.getElementById("grid-list-sortable");
  const list = document.getElementById("grid-list-sortable-list");
  const labels = { brief: "需求梳理", design: "交互设计", build: "开发实现" };
  sortable.partRoots = [...sortable.querySelectorAll('[data-xh-part-owner="sortable"]')];
  list.partRoots = [...list.querySelectorAll('[data-xh-part-owner="grid-list"][data-xh-part="row"]')];
  sortable.ids = ["brief", "design", "build"];
  list.collection = sortable.ids.map(value => ({ value, label: labels[value] }));
  sortable.addEventListener("sort", (event) => {
    sortable.ids = event.detail.ids;
    const root = list.querySelector('[data-xh-part="root"]');
    for (const id of event.detail.ids) root.append(root.querySelector('[item-id="' + id + '"]'));
    list.collection = event.detail.ids.map(value => ({ value, label: labels[value] }));
    sortable.requestUpdate();
    list.requestUpdate();
  });
<\/script>
`;export{e as default};