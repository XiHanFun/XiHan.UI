const a=`<!-- 中间层可选 | change-on-select 让分支自己也能落值；选中分支后浮层不收起，还能接着往下挑 -->
<xh-cascader
  id="cascader-change-on-select"
  change-on-select
  separator=" › "
  placeholder="选一个栏目"
>
  <div data-xh-part="root">
    <span data-xh-part="label">栏目</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator"></span>
    </button>
    <button data-xh-part="clear-trigger"></button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value="docs">
            <span data-xh-part="item-text">文档</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="design">
            <span data-xh-part="item-text">设计</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="column" level="1">
          <div data-xh-part="item" value="guide">
            <span data-xh-part="item-text">指南</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="api">
            <span data-xh-part="item-text">接口</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="token">
            <span data-xh-part="item-text">设计令牌</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="icon">
            <span data-xh-part="item-text">图标</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-cascader>
<p>当前路径：<span id="cascader-change-on-select-value">（未选）</span></p>

<script type="module">
  const cascader = document.getElementById("cascader-change-on-select");
  cascader.collection = [
    {
      value: "docs",
      label: "文档",
      children: [
        { value: "guide", label: "指南" },
        { value: "api", label: "接口" },
      ],
    },
    {
      value: "design",
      label: "设计",
      children: [
        { value: "token", label: "设计令牌" },
        { value: "icon", label: "图标" },
      ],
    },
  ];

  const readout = document.getElementById("cascader-change-on-select-value");
  cascader.addEventListener("value-change", (event) => {
    const path = event.detail.value[0];
    readout.textContent = path ? path.join(" › ") : "（未选）";
  });
<\/script>
`;export{a as default};
