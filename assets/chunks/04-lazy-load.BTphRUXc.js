const n=`<!-- 懒加载 | 节点写 hasChildren 不给 children，展开路径走到它时由 loadChildren 取回直接子项；在途与失败都显示在它那一列里，失败在父条目上按 Enter 或点重试钮再取 -->
<xh-cascader id="cascader-lazy-load" placeholder="请选择地区">
  <div data-xh-part="root">
    <span data-xh-part="label">收货地区</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value="zhejiang">
            <span data-xh-part="item-text">浙江</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="jiangsu">
            <span data-xh-part="item-text">江苏</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <!-- 取回的城市由脚本铺进这一列；在途与失败的提示由元素补在列末 -->
        <div data-xh-part="column" level="1"></div>
      </div>
    </div>
  </div>
</xh-cascader>

<script type="module">
  const cascader = document.getElementById("cascader-lazy-load");
  const level1 = cascader.querySelector('[data-xh-part="column"][level="1"]');

  // 只写到省一级：下一层等展开时再取
  cascader.collection = [
    { value: "zhejiang", label: "浙江", hasChildren: true },
    { value: "jiangsu", label: "江苏", hasChildren: true },
  ];

  // 下一层的数据在后端，这里用定时器代替一次请求
  const remote = {
    zhejiang: [
      { value: "hangzhou", label: "杭州" },
      { value: "ningbo", label: "宁波" },
      { value: "wenzhou", label: "温州" },
    ],
    jiangsu: [
      { value: "nanjing", label: "南京" },
      { value: "suzhou", label: "苏州" },
    ],
  };

  // 浮层收起或展开路径离开这一支时 signal 中止，把定时器一起撤掉；函数只走属性
  cascader.loadChildren = ({ node, signal }) => new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(remote[node.value] ?? []), 800);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });

  // 取回来就把条目铺进第二列：露哪几条由元素按展开路径决定
  cascader.addEventListener("branch-load", (event) => {
    const items = event.detail.children.map((child) => {
      const item = document.createElement("div");
      item.setAttribute("data-xh-part", "item");
      item.setAttribute("value", child.value);
      const text = document.createElement("span");
      text.setAttribute("data-xh-part", "item-text");
      text.textContent = child.label;
      const indicator = document.createElement("span");
      indicator.setAttribute("data-xh-part", "item-indicator");
      item.append(text, indicator);
      return item;
    });
    // 排在元素补的那几块状态提示前面
    level1.prepend(...items);
  });
<\/script>
`;export{n as default};
