const t=`<!-- 垂直布局 | 展示纵向流程与步骤内容 -->
<xh-steps id="steps-vertical" count="3" default-value="1" orientation="vertical">
  <div data-xh-part="root">
    <div data-xh-part="list">
      <div data-xh-part="item" value="0">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator"></span>
          <span data-xh-part="title">打包</span>
          <span data-xh-part="description">生成产物</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="1">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">2</span>
          <span data-xh-part="title">测试</span>
          <span data-xh-part="description">跑单元测试</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
      <div data-xh-part="item" value="2">
        <button data-xh-part="trigger">
          <span data-xh-part="indicator">3</span>
          <span data-xh-part="title">发布</span>
          <span data-xh-part="description">推到镜像仓库</span>
        </button>
        <div data-xh-part="separator"></div>
      </div>
    </div>

    <div data-xh-part="content" value="0">查看构建产物。</div>
    <div data-xh-part="content" value="1">检查测试报告。</div>
    <div data-xh-part="content" value="2">确认发布记录。</div>
    <div data-xh-part="content" value="3">流水线已完成。</div>
  </div>
</xh-steps>

<script type="module">
  const host = document.getElementById("steps-vertical");
  const indicators = [...host.querySelectorAll('[data-xh-part="indicator"]')];

  host.addEventListener("value-change", (event) => {
    indicators.forEach((indicator, index) => {
      indicator.textContent = event.detail.value > index ? "" : String(index + 1);
    });
  });
<\/script>
`;export{t as default};
