const n=`<!-- 缩小触发区域 | trigger 只包住指示器，标题文字留在 header 里，点标题不再展开 -->
<div style="width: 100%; max-width: 420px">
  <xh-accordion id="accordion-trigger-area">
    <div data-xh-part="root">
      <div data-xh-part="item" value="profile">
        <!-- 标题栏自己排布：文字是普通节点，按钮只占末尾一小格 -->
        <h3
          data-xh-part="header"
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding-inline-start: 12px;
          "
        >
          <span style="flex: 1">账户资料</span>
          <button
            data-xh-part="trigger"
            style="inline-size: auto"
            aria-label="展开账户资料"
          >
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">只有右边那个按钮能展开这一段。</div>
      </div>
      <div data-xh-part="item" value="billing">
        <h3
          data-xh-part="header"
          style="
            display: flex;
            align-items: center;
            gap: 8px;
            padding-inline-start: 12px;
          "
        >
          <span style="flex: 1">账单信息</span>
          <button
            data-xh-part="trigger"
            style="inline-size: auto"
            aria-label="展开账单信息"
          >
            <span data-xh-part="indicator"></span>
          </button>
        </h3>
        <div data-xh-part="content">标题文字不在按钮里，点它没有反应。</div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 展开集合是数组，只走 property：设初值、每次变更写回
  const accordion = document.getElementById("accordion-trigger-area");
  accordion.value = ["profile"];
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
<\/script>
`;export{n as default};
