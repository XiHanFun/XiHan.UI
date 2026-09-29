const t=`<!-- 当前步进度 | 用 percent 在当前步的圆点外画一圈进度环，报出这一步自己完成了多少 -->
<xh-steps id="steps-progress" count="3" default-value="1" percent="60">
  <div data-xh-part="root">
    <div data-xh-part="list">
      <div data-xh-part="item" value="0">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">选择文件</span>
          <span data-xh-part="description">共 12 个</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="1">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">2</span>
          <span data-xh-part="title">上传</span>
          <span data-xh-part="description">已传 7 个</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="2">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">3</span>
          <span data-xh-part="title">校验</span>
          <span data-xh-part="description">等待中</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
    </div>
  </div>
</xh-steps>

<script type="module">
  const host = document.getElementById("steps-progress");
  const indicators = [...host.querySelectorAll('[data-xh-part="indicator"]')];

  host.addEventListener("value-change", (event) => {
    indicators.forEach((indicator, index) => {
      indicator.textContent = event.detail.value > index ? "" : String(index + 1);
    });
  });
<\/script>
`;export{t as default};
