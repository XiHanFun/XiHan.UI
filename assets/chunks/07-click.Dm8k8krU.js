const t=`<!-- 点击切步与禁用某步 | 点标签直接切到那一步；单步标了 disabled 就点不动，方向键也跳过它 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-steps id="steps-click" step="0" count="4">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <div data-xh-part="item" value="0">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">1</span>
            <span data-xh-part="title">选择商品</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="1">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">2</span>
            <span data-xh-part="title">确认订单</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="2" aria-disabled="true">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">3</span>
            <span data-xh-part="title">在线支付</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
        <div data-xh-part="item" value="3">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator">4</span>
            <span data-xh-part="title">等待发货</span>
          </button>
          <div data-xh-part="separator"></div>
        </div>
      </div>

      <div data-xh-part="content" value="0">面板 1：选择商品</div>
      <div data-xh-part="content" value="1">面板 2：确认订单</div>
      <div data-xh-part="content" value="2">面板 3：在线支付</div>
      <div data-xh-part="content" value="3">面板 4：等待发货</div>
      <div data-xh-part="content" value="4">全部完成。</div>
    </div>
  </xh-steps>

  <span>当前 step：<span id="steps-click-value">0</span>（第三步禁用，点它没有反应）</span>
</div>

<script type="module">
  // 步序只在这里写，圆点里的对勾与序号跟着它走
  const steps = document.getElementById("steps-click");
  const readout = document.getElementById("steps-click-value");
  const indicators = [...steps.querySelectorAll('[data-xh-part="indicator"]')];

  steps.addEventListener("step-change", (event) => {
    const next = event.detail.step;
    steps.step = next;
    readout.textContent = String(next);
    indicators.forEach((indicator, index) => {
      indicator.textContent = next > index ? "✓" : String(index + 1);
    });
  });
<\/script>
`;export{t as default};
