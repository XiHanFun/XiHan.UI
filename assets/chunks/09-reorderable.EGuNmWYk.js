const t=`<!-- 拖拽排序 | 按住标签拖到新位置，或焦点在标签上按 Alt + 方向键挪一位 -->
<xh-tabs id="tabs-reorderable" default-value="board" reorderable>
  <div data-xh-part="root" style="inline-size: 420px; max-inline-size: 100%">
    <div data-xh-part="list" aria-label="视图">
      <button data-xh-part="trigger" value="board">看板</button>
      <button data-xh-part="trigger" value="list">列表</button>
      <button data-xh-part="trigger" value="calendar">日历</button>
      <button data-xh-part="trigger" value="timeline">时间线</button>
      <div data-xh-part="indicator"></div>
    </div>

    <div data-xh-part="content" value="board">按看板查看任务。</div>
    <div data-xh-part="content" value="list">按列表查看任务。</div>
    <div data-xh-part="content" value="calendar">按日历查看任务。</div>
    <div data-xh-part="content" value="timeline">按时间线查看任务。</div>
  </div>
</xh-tabs>

<script type="module">
  // 元素只报重排好的新顺序：按它把标签节点挪到位，再写回 collection 才算挪动
  const tabs = document.getElementById("tabs-reorderable");
  const list = tabs.querySelector('[data-xh-part="list"]');
  const indicator = tabs.querySelector('[data-xh-part="indicator"]');
  tabs.collection = [...list.querySelectorAll('[data-xh-part="trigger"]')].map((el) => ({ value: el.getAttribute("value") }));
  tabs.addEventListener("tab-move", (event) => {
    for (const value of event.detail.values)
      list.insertBefore(list.querySelector(\`[data-xh-part="trigger"][value="\${value}"]\`), indicator);
    tabs.collection = event.detail.values.map((value) => ({ value }));
  });
<\/script>
`;export{t as default};
