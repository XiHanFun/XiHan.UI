const t=`<!-- 受控 | 传了 open 与 step 就由宿主说了算：内部不再自改，只发意图，浮层里的按钮与外面的进度读的是同一份状态 -->
<xh-tour id="tour-controlled" open="false" step="0">
  <div data-xh-part="root">
    <div style="display: grid; gap: 16px; justify-items: start">
      <div style="display: flex; flex-wrap: wrap; gap: 12px">
        <div
          id="tour-controlled-list"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          列表
        </div>
        <div
          id="tour-controlled-detail"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          详情
        </div>
        <div
          id="tour-controlled-actions"
          style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
        >
          操作
        </div>
      </div>
      <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px">
        <xh-button variant="solid">
          <button data-xh-part="root" id="tour-controlled-from-start">从头开始</button>
        </xh-button>
        <xh-button variant="outline">
          <button data-xh-part="root" id="tour-controlled-from-third">
            直接跳到第 3 步
          </button>
        </xh-button>
        <span id="tour-controlled-readout" style="font-size: 13px; opacity: 0.75">
          open=false · step=0 · （未开始）
        </span>
      </div>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button data-xh-part="next-trigger">下一步</button>
        </div>
        <button data-xh-part="close-trigger"></button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-controlled");
  const readout = document.getElementById("tour-controlled-readout");
  let log = "（未开始）";

  tour.steps = [
    {
      id: "list",
      target: "#tour-controlled-list",
      title: "列表",
      description: "记录都在这里。",
    },
    {
      id: "detail",
      target: "#tour-controlled-detail",
      title: "详情",
      description: "选中一条后在这块看明细。",
    },
    {
      id: "actions",
      target: "#tour-controlled-actions",
      title: "操作",
      description: "批量动作收在这一栏。",
    },
  ];

  function render() {
    readout.textContent = \`open=\${tour.open} · step=\${tour.step} · \${log}\`;
  }

  // 从第几步起都由宿主先落值，再打开
  function start(from) {
    tour.step = from;
    tour.open = true;
    render();
  }

  document
    .getElementById("tour-controlled-from-start")
    .addEventListener("click", () => start(0));
  document
    .getElementById("tour-controlled-from-third")
    .addEventListener("click", () => start(2));

  // 内部只发意图，落值全在这几个处理器里
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
    render();
  });
  tour.addEventListener("step-change", (event) => {
    tour.step = event.detail.step;
    render();
  });
  tour.addEventListener("complete", (event) => {
    log = \`走完了第 \${event.detail.step + 1} 步\`;
    render();
  });
  tour.addEventListener("skip", (event) => {
    log = \`在第 \${event.detail.step + 1} 步放弃\`;
    render();
  });
<\/script>
`;export{t as default};
