var e=`<!-- 指示器在后 | 缺省的箭头排在标题之前；指示器写在标题之后即落到行尾 -->
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-indicator-end">
    <div data-xh-part="root">
      <div data-xh-part="item" value="one">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第一章</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">指示器在行尾，展开时照样转向。</div>
      </div>
      <div data-xh-part="item" value="two">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第二章</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">部件的先后顺序就是它们在标题栏里的顺序。</div>
      </div>
      <div data-xh-part="item" value="three">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>第三章</span>
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">余量落在标题与指示器之间。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-indicator-end");
  accordion.value = ["one"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
<\/script>
`;export{e as default};