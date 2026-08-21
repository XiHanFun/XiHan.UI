const n=`<!-- 指示器在前 | 指示器写在标题之前就落到起始缘，标题拿 auto 外边距吃掉余量 -->
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-indicator-start">
    <div data-xh-part="root">
      <div data-xh-part="item" value="one">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span style="margin-inline-end: auto">第一章</span>
          </button>
        </h3>
        <div data-xh-part="content">指示器在标题左边，展开时照样翻转。</div>
      </div>
      <div data-xh-part="item" value="two">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span style="margin-inline-end: auto">第二章</span>
          </button>
        </h3>
        <div data-xh-part="content">部件的先后顺序就是它们在标题栏里的顺序。</div>
      </div>
      <div data-xh-part="item" value="three">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span data-xh-part="indicator"></span>
            <span style="margin-inline-end: auto">第三章</span>
          </button>
        </h3>
        <div data-xh-part="content">标题吃掉余量，右侧留白。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-indicator-start");
  accordion.value = ["one"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
<\/script>
`;export{n as default};
