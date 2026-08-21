const a=`<!-- 基础用法 | collection 是层级、显示文本与禁用的唯一事实源；levels 按深度摊开，每层一个 column -->
<xh-cascader id="cascader-basic" placeholder="请选择地区">
  <div data-xh-part="root">
    <span data-xh-part="label">收货地区</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator">▾</span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value="zhejiang">
            <span data-xh-part="item-text">浙江</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="jiangsu">
            <span data-xh-part="item-text">江苏</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
        <div data-xh-part="column" level="1">
          <div data-xh-part="item" value="hangzhou">
            <span data-xh-part="item-text">杭州</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="ningbo">
            <span data-xh-part="item-text">宁波</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="nanjing">
            <span data-xh-part="item-text">南京</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
        <div data-xh-part="column" level="2">
          <div data-xh-part="item" value="xihu">
            <span data-xh-part="item-text">西湖区</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="binjiang">
            <span data-xh-part="item-text">滨江区</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="haishu">
            <span data-xh-part="item-text">海曙区</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="xuanwu">
            <span data-xh-part="item-text">玄武区</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
          <div data-xh-part="item" value="gulou">
            <span data-xh-part="item-text">鼓楼区（暂不开放）</span>
            <span data-xh-part="item-indicator">✓</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-cascader>
<p>当前路径：<span id="cascader-basic-value">（未选）</span></p>

<script type="module">
  // 树数据是数组，只走属性；标记里的列与条目照它的层级摆
  const cascader = document.getElementById("cascader-basic");
  cascader.collection = [
    {
      value: "zhejiang",
      label: "浙江",
      children: [
        {
          value: "hangzhou",
          label: "杭州",
          children: [
            { value: "xihu", label: "西湖区" },
            { value: "binjiang", label: "滨江区" },
          ],
        },
        {
          value: "ningbo",
          label: "宁波",
          children: [{ value: "haishu", label: "海曙区" }],
        },
      ],
    },
    {
      value: "jiangsu",
      label: "江苏",
      children: [
        {
          value: "nanjing",
          label: "南京",
          children: [
            { value: "xuanwu", label: "玄武区" },
            { value: "gulou", label: "鼓楼区（暂不开放）", disabled: true },
          ],
        },
      ],
    },
  ];

  const readout = document.getElementById("cascader-basic-value");
  cascader.addEventListener("value-change", (event) => {
    const path = event.detail.value[0];
    readout.textContent = path ? path.join(" / ") : "（未选）";
  });
<\/script>
`;export{a as default};
