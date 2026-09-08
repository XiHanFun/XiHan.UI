const a=`<!-- 形态 | plain 不画壳，surface 给整块一层面，bordered 逐条画边；三档只改怎么与页面分开 -->
<div
  id="accordion-variants"
  style="display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))"
>
  <xh-accordion variant="plain">
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送方式</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">下单后 48 小时内发出。</div>
      </div>
      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换政策</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">签收 7 天内可申请退换。</div>
      </div>
    </div>
  </xh-accordion>

  <xh-accordion variant="surface">
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送方式</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">下单后 48 小时内发出。</div>
      </div>
      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换政策</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">签收 7 天内可申请退换。</div>
      </div>
    </div>
  </xh-accordion>

  <xh-accordion variant="bordered">
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送方式</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">下单后 48 小时内发出。</div>
      </div>
      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换政策</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">签收 7 天内可申请退换。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：逐组设初值、每次变更写回
  const grid = document.getElementById("accordion-variants");
  for (const accordion of grid.querySelectorAll("xh-accordion")) {
    accordion.value = ["shipping"];
    accordion.addEventListener("value-change", (event) => {
      accordion.value = event.detail.value;
    });
  }
<\/script>
`;export{a as default};
