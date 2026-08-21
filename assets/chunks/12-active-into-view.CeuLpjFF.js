const t=`<!-- 切换后滚进视野 | 每个标签都带 data-value 身份标记，选中值一变就按它取到那个标签，滚到视口正中 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-tabs id="tabs-into-view" variant="segment" value="chapter-1">
    <div data-xh-part="root">
      <div id="tabs-into-view-viewport" style="overflow-x: auto">
        <div data-xh-part="list" style="inline-size: max-content">
          <button data-xh-part="trigger" value="chapter-1">第 1 章</button>
          <button data-xh-part="trigger" value="chapter-2">第 2 章</button>
          <button data-xh-part="trigger" value="chapter-3">第 3 章</button>
          <button data-xh-part="trigger" value="chapter-4">第 4 章</button>
          <button data-xh-part="trigger" value="chapter-5">第 5 章</button>
          <button data-xh-part="trigger" value="chapter-6">第 6 章</button>
          <button data-xh-part="trigger" value="chapter-7">第 7 章</button>
          <button data-xh-part="trigger" value="chapter-8">第 8 章</button>
          <button data-xh-part="trigger" value="chapter-9">第 9 章</button>
          <button data-xh-part="trigger" value="chapter-10">第 10 章</button>
          <button data-xh-part="trigger" value="chapter-11">第 11 章</button>
          <button data-xh-part="trigger" value="chapter-12">第 12 章</button>
        </div>
      </div>

      <div data-xh-part="content" value="chapter-1">第 1 章 的面板</div>
      <div data-xh-part="content" value="chapter-2">第 2 章 的面板</div>
      <div data-xh-part="content" value="chapter-3">第 3 章 的面板</div>
      <div data-xh-part="content" value="chapter-4">第 4 章 的面板</div>
      <div data-xh-part="content" value="chapter-5">第 5 章 的面板</div>
      <div data-xh-part="content" value="chapter-6">第 6 章 的面板</div>
      <div data-xh-part="content" value="chapter-7">第 7 章 的面板</div>
      <div data-xh-part="content" value="chapter-8">第 8 章 的面板</div>
      <div data-xh-part="content" value="chapter-9">第 9 章 的面板</div>
      <div data-xh-part="content" value="chapter-10">第 10 章 的面板</div>
      <div data-xh-part="content" value="chapter-11">第 11 章 的面板</div>
      <div data-xh-part="content" value="chapter-12">第 12 章 的面板</div>
    </div>
  </xh-tabs>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="tabs-into-view-last" size="sm" variant="outline">
      <button data-xh-part="root">跳到第 12 章</button>
    </xh-button>
    <xh-button id="tabs-into-view-first" size="sm" variant="outline">
      <button data-xh-part="root">回到第 1 章</button>
    </xh-button>
    <span>用方向键走位时，标签栏也会跟着滚</span>
  </div>
</div>

<script type="module">
  // 选中值只从这一个口子写：外部改值、键盘走位、点击三条路都经过它
  const tabs = document.getElementById("tabs-into-view");
  const viewport = document.getElementById("tabs-into-view-viewport");
  const last = document.getElementById("tabs-into-view-last");
  const first = document.getElementById("tabs-into-view-first");

  function setValue(next) {
    tabs.value = next;
    viewport
      .querySelector(\`[data-part="trigger"][data-value="\${next}"]\`)
      ?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }

  tabs.addEventListener("value-change", (event) => setValue(event.detail.value));
  last.addEventListener("click", () => setValue("chapter-12"));
  first.addEventListener("click", () => setValue("chapter-1"));
<\/script>
`;export{t as default};
