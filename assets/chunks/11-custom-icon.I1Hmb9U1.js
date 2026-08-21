const n=`<!-- 自定义展开图标 | indicator 是可选部件，不渲染它就没有默认字形；标记由作者按展开集合自己画 -->
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-custom-icon" multiple>
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送方式</span>
            <span data-mark style="font-size: 12px; color: var(--xh-fg-muted)">＋</span>
          </button>
        </h3>
        <div data-xh-part="content">同城次日达，跨省三日达。</div>
      </div>
      <div data-xh-part="item" value="invoice">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>发票</span>
            <span data-mark style="font-size: 12px; color: var(--xh-fg-muted)">＋</span>
          </button>
        </h3>
        <div data-xh-part="content">支持电子普票与专票。</div>
      </div>
      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换货</span>
            <span data-mark style="font-size: 12px; color: var(--xh-fg-muted)">＋</span>
          </button>
        </h3>
        <div data-xh-part="content">签收七日内无理由退换。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 标记按这一项在不在展开集合里换字形
  const accordion = document.getElementById("accordion-custom-icon");
  const paint = (value) => {
    for (const item of accordion.querySelectorAll('[data-xh-part="item"]')) {
      const mark = item.querySelector("[data-mark]");
      mark.textContent = value.includes(item.getAttribute("value")) ? "－" : "＋";
    }
  };
  accordion.value = ["shipping"];
  paint(accordion.value);
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
    paint(event.detail.value);
  });
<\/script>
`;export{n as default};
