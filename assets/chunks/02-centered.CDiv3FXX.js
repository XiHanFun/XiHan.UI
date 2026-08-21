const t=`<!-- 居中步 | 不写 target 的那一步不锚定任何元素：浮层居中、不画高亮框、也不出箭头，适合当开场白与收尾 -->
<xh-tour id="tour-centered" spotlight-padding="12">
  <div data-xh-part="root">
    <div style="display: grid; gap: 16px; justify-items: start">
      <div
        id="tour-centered-inbox"
        style="padding: 8px 14px; border: 1px solid var(--vp-c-divider); border-radius: 8px"
      >
        收件箱
      </div>
      <xh-button variant="solid">
        <button data-xh-part="root" id="tour-centered-start">开始引导</button>
      </xh-button>
      <span id="tour-centered-current" style="font-size: 13px; opacity: 0.75">
        当前步：welcome
      </span>
    </div>

    <div data-xh-part="backdrop"></div>
    <div data-xh-part="spotlight"></div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <h3 data-xh-part="title"></h3>
        <p data-xh-part="description"></p>
        <p data-xh-part="progress-text"></p>
        <div style="display: flex; align-items: center; gap: 8px">
          <button data-xh-part="prev-trigger">上一步</button>
          <button data-xh-part="next-trigger" id="tour-centered-next">下一步</button>
          <button data-xh-part="skip-trigger">跳过</button>
        </div>
        <button data-xh-part="close-trigger">✕</button>
        <div data-xh-part="arrow"></div>
      </div>
    </div>
  </div>
</xh-tour>

<script type="module">
  const tour = document.getElementById("tour-centered");

  // 头尾两步没有 target，浮层落在屏幕正中
  tour.steps = [
    {
      id: "welcome",
      title: "欢迎",
      description: "这一步没有 target，浮层落在屏幕正中。",
    },
    {
      id: "inbox",
      target: "#tour-centered-inbox",
      title: "收件箱",
      description: "锚定到元素上，箭头与高亮框一并出现。",
    },
    {
      id: "done",
      title: "就这些",
      description: "最后一步同样不锚定，收个尾。",
    },
  ];
  tour.translations = {
    close: "关闭",
    progress: (step, count) => \`第 \${step} 步，共 \${count} 步\`,
  };

  // 开合由宿主保管：按钮打开，组件要关时写回
  document.getElementById("tour-centered-start").addEventListener("click", () => {
    tour.open = true;
  });
  tour.addEventListener("open-change", (event) => {
    tour.open = event.detail.open;
  });

  // 外面这行文字跟着步序走
  const current = document.getElementById("tour-centered-current");
  const next = document.getElementById("tour-centered-next");
  tour.addEventListener("step-change", (event) => {
    current.textContent = \`当前步：\${tour.steps[event.detail.step].id}\`;
    next.textContent =
      event.detail.step === tour.steps.length - 1 ? "完成" : "下一步";
  });
<\/script>
`;export{t as default};
