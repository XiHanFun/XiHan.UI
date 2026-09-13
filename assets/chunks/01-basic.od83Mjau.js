const t=`<!-- 基础用法 | 逐步介绍页面中的关键操作 -->
<xh-tour id="tour-basic">
  <div data-xh-part="root">
    <div style="display: flex; flex-wrap: wrap; gap: 8px">
      <xh-button variant="outline"><button id="tour-basic-search" data-xh-part="root">搜索</button></xh-button>
      <xh-button variant="outline"><button id="tour-basic-filter" data-xh-part="root">筛选</button></xh-button>
      <xh-button variant="outline"><button id="tour-basic-export" data-xh-part="root">导出</button></xh-button>
      <xh-button variant="solid">
        <button data-xh-part="root" id="tour-basic-start">开始引导</button>
      </xh-button>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <p data-xh-part="progress-text"></p>
        <div data-xh-part="progress-indicator">
          <div data-xh-part="progress-dot" index="0"></div>
          <div data-xh-part="progress-dot" index="1"></div>
          <div data-xh-part="progress-dot" index="2"></div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button data-xh-part="next-trigger" id="tour-basic-next">
            下一步
          </button>
          <button data-xh-part="skip-trigger">跳过</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-basic");

  tour.steps = [
    {
      id: "search",
      target: "#tour-basic-search",
      title: "全站搜索",
      description: "按名称或编号找记录，支持拼音首字母。",
      placement: "bottom",
    },
    {
      id: "filter",
      target: "#tour-basic-filter",
      title: "筛选",
      description: "按状态与时间区间收窄结果，条件会记在本地。",
      placement: "bottom",
    },
    {
      id: "export",
      target: "#tour-basic-export",
      title: "导出",
      description: "导出当前筛选后的全部数据，走后台队列。",
      placement: "bottom-end",
    },
  ];
  tour.translations = {
    close: "关闭",
    progress: (step, count) => \`第 \${step} 步，共 \${count} 步\`,
  };

  document.getElementById("tour-basic-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });

  const next = document.getElementById("tour-basic-next");
  tour.addEventListener("value-change", (event) => {
    next.textContent =
      event.detail.value === tour.steps.length - 1 ? "完成" : "下一步";
  });
<\/script>
`;export{t as default};
