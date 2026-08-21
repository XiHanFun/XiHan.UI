const a=`<!-- 指示器与禁用 | indicator 的朝向由 data-state 驱动，禁用项点不动、方向键也跳过它 -->
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-indicator">
    <div data-xh-part="root">
      <div data-xh-part="item" value="ready">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>已发布</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">
          标题右侧那个箭头就是 indicator，展开时自动翻转。
        </div>
      </div>
      <!-- 禁用写在条目节点上，条目内的部件跟着它走 -->
      <div data-xh-part="item" value="draft" aria-disabled="true">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>草稿（禁用）</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">这一项展不开。</div>
      </div>
      <div data-xh-part="item" value="archived">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>已归档</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">从第一项按方向键，会直接跳到这里。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-indicator");
  accordion.value = ["ready"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
<\/script>
`;export{a as default};
