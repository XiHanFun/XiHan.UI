const n=`<!-- 允许全收 | 单开模式下最后一项默认收不起来，加 collapsible 才能把它也收上 -->
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-collapsible" collapsible>
    <div data-xh-part="root">
      <div data-xh-part="item" value="one">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>再点一次就收起</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          点当前展开项的标题，它会收起，展开集合变成空数组。
        </div>
      </div>
      <div data-xh-part="item" value="two">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>另一项</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          展开它会把上一项挤掉，单开模式一次只留一项。
        </div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-collapsible");
  accordion.value = ["one"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
<\/script>
`;export{n as default};
