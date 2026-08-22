const t=`<!-- 出错的那一步 | 步序只认下标，「这一步出错了」是宿主自己的数据：在那一步的 item 上换掉标记与颜色令牌 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-steps id="steps-error" step="1" count="3">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <div data-xh-part="item" value="0">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span data-xh-part="title">提交材料</span>
            <span data-xh-part="description">已通过</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <!-- 当前档与已走过档一起换成危险色，写在 item 上，序号、标题与连接线都从这里继承 -->
        <div
          data-xh-part="item"
          value="1"
          style="
            --xh-steps-indicator-border-current: var(--xh-fg-danger);
            --xh-steps-indicator-fg-current: var(--xh-fg-danger);
            --xh-steps-indicator-border-completed: var(--xh-fg-danger);
            --xh-steps-indicator-bg-completed: var(--xh-fg-danger);
            --xh-steps-title-fg-active: var(--xh-fg-danger);
            --xh-steps-separator-bg-completed: var(--xh-fg-danger);
          "
        >
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">!</span>
            <span data-xh-part="title">资质审核</span>
            <span data-xh-part="description">材料不齐，被打回</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="2">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">3</span>
            <span data-xh-part="title">签署合同</span>
            <span data-xh-part="description">等待中</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
      </div>
    </div>
  </xh-steps>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="steps-error-third" size="sm" variant="outline">
      <button data-xh-part="root">走到第三步</button>
    </xh-button>
    <xh-button id="steps-error-second" size="sm" variant="outline">
      <button data-xh-part="root">退回第二步</button>
    </xh-button>
    <span>第二步无论是当前步还是已走过，都停在危险色上</span>
  </div>
</div>

<script type="module">
  // 步序只在这里写；出错那一步的标记固定是感叹号，其余跟着步序走
  const errorAt = 1;
  const steps = document.getElementById("steps-error");
  const third = document.getElementById("steps-error-third");
  const second = document.getElementById("steps-error-second");
  const indicators = [...steps.querySelectorAll('[data-xh-part="indicator"]')];

  function setStep(next) {
    steps.step = next;
    indicators.forEach((indicator, index) => {
      indicator.textContent =
        index === errorAt ? "!" : next > index ? "" : String(index + 1);
    });
  }

  steps.addEventListener("step-change", (event) => setStep(event.detail.step));
  third.addEventListener("click", () => setStep(2));
  second.addEventListener("click", () => setStep(1));
<\/script>
`;export{t as default};
