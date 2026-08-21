const a=`<!-- 条目自定义内容 | 条目里放什么由作者定：文本后面加一段附加信息，分支箭头由皮肤自动画 -->
<style>
  #cascader-rich-item [data-headcount] {
    flex: none;
    color: var(--xh-fg-subtle);
    font-size: 12px;
  }
</style>

<xh-cascader id="cascader-rich-item" placeholder="请选择团队">
  <div data-xh-part="root">
    <span data-xh-part="label">团队</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator">▾</span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value="product">
            <span data-xh-part="item-text">产品线</span>
            <!-- 条目上的附加信息由作者自己写，组件只管值与层级 -->
            <span data-headcount>18 人</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="tech">
            <span data-xh-part="item-text">技术线</span>
            <span data-headcount>32 人</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
        <div data-xh-part="column" level="1">
          <div data-xh-part="item" value="design">
            <span data-xh-part="item-text">设计组</span>
            <span data-headcount>11 人</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="research">
            <span data-xh-part="item-text">用研组</span>
            <span data-headcount>7 人</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="web">
            <span data-xh-part="item-text">前端组</span>
            <span data-headcount>14 人</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="server">
            <span data-xh-part="item-text">服务端组</span>
            <span data-headcount>18 人</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-cascader>
<p>当前团队：<span id="cascader-rich-item-value">（未选）</span></p>

<script type="module">
  const cascader = document.getElementById("cascader-rich-item");
  cascader.collection = [
    {
      value: "product",
      label: "产品线",
      children: [
        { value: "design", label: "设计组" },
        { value: "research", label: "用研组" },
      ],
    },
    {
      value: "tech",
      label: "技术线",
      children: [
        { value: "web", label: "前端组" },
        { value: "server", label: "服务端组" },
      ],
    },
  ];

  const readout = document.getElementById("cascader-rich-item-value");
  cascader.addEventListener("value-change", (event) => {
    const path = event.detail.value[0];
    readout.textContent = path ? path.join(" / ") : "（未选）";
  });
<\/script>
`;export{a as default};
