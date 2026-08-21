const n=`<!-- 嵌套 | content 里再放一组手风琴，内外两组各自维护展开集合，方向键也各管各的 -->
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-outer">
    <div data-xh-part="root">
      <div data-xh-part="item" value="shipping">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>配送</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          <!-- 内层是另一组独立的手风琴：展开集合、单开与否都自己说了算 -->
          <xh-accordion id="accordion-inner" multiple>
            <div data-xh-part="root">
              <div data-xh-part="item" value="express">
                <h3 data-xh-part="header">
                  <button data-xh-part="trigger">
                    <span>快递</span>
                    <span data-xh-part="indicator"></span>
                  </button>
                </h3>
                <div data-xh-part="content">次日达，节假日照常发货。</div>
              </div>
              <div data-xh-part="item" value="pickup">
                <h3 data-xh-part="header">
                  <button data-xh-part="trigger">
                    <span>自提</span>
                    <span data-xh-part="indicator"></span>
                  </button>
                </h3>
                <div data-xh-part="content">下单后到门店凭码取货。</div>
              </div>
            </div>
          </xh-accordion>
        </div>
      </div>

      <div data-xh-part="item" value="refund">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>退换</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">签收七日内可退，运费到付。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：内外两组各设各的初值、各写各的回
  const outer = document.getElementById("accordion-outer");
  const inner = document.getElementById("accordion-inner");
  outer.value = ["shipping"];
  inner.value = ["express"];
  // 内层的事件会冒泡上来，只认自己派的那份
  outer.addEventListener("value-change", (event) => {
    if (event.target === outer) outer.value = event.detail.value;
  });
  inner.addEventListener("value-change", (event) => {
    inner.value = event.detail.value;
  });
<\/script>
`;export{n as default};
