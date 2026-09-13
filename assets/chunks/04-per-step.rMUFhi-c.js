const t=`<!-- 无遮罩 | 保留页面环境并突出目标 -->
<xh-tour id="tour-clear" show-backdrop="false">
  <div data-xh-part="root">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <xh-button variant="outline"><button id="tour-clear-search" data-xh-part="root">搜索</button></xh-button>
      <xh-button variant="outline"><button id="tour-clear-filter" data-xh-part="root">筛选</button></xh-button>
      <xh-button variant="solid"><button id="tour-clear-start" data-xh-part="root">开始引导</button></xh-button>
    </div>

    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <p data-xh-part="progress-text"></p>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button id="tour-clear-next" data-xh-part="next-trigger">下一步</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-clear");
  const next = document.getElementById("tour-clear-next");

  tour.steps = [
    { id: "search", target: "#tour-clear-search", title: "搜索", description: "输入关键词查找记录。" },
    { id: "filter", target: "#tour-clear-filter", title: "筛选", description: "按状态收窄结果。" },
  ];
  tour.translations = {
    close: "关闭",
    progress: (step, count) => \`第 \${step} 步，共 \${count} 步\`,
  };

  document.getElementById("tour-clear-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });
  tour.addEventListener("value-change", (event) => {
    next.textContent = event.detail.value === tour.steps.length - 1 ? "完成" : "下一步";
  });
<\/script>
`;export{t as default};
