const n=`<!-- 语气 | tone 落在展开态的标题上，六种语气各预置一项展开做对照 -->
<div
  id="accordion-tones"
  style="
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  "
>
  <xh-accordion tone="brand">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>品牌（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="brand"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>品牌（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="neutral">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>中性（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="neutral"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>中性（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="success">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>成功（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="success"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>成功（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="warning">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>警告（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="warning"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>警告（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="danger">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>危险（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="danger"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>危险（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
  <xh-accordion tone="info">
    <div data-xh-part="root">
      <div data-xh-part="item" value="open">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>信息（展开）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">tone="info"</div>
      </div>
      <div data-xh-part="item" value="closed">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>信息（收起）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">收起态的标题不吃语气色。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：逐组设初值、每次变更写回
  const grid = document.getElementById("accordion-tones");
  for (const accordion of grid.querySelectorAll("xh-accordion")) {
    accordion.value = ["open"];
    accordion.addEventListener("value-change", (event) => {
      accordion.value = event.detail.value;
    });
  }
<\/script>
`;export{n as default};
