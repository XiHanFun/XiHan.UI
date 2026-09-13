const a=`<!-- 多选 | 选择多个分类路径 -->
<xh-cascader id="cascader-multiple" multiple placeholder="可以多挑几条">
  <div data-xh-part="root">
    <span data-xh-part="label">采购清单</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value="fruit">
            <span data-xh-part="item-text">水果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="vegetable">
            <span data-xh-part="item-text">蔬菜</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="column" level="1">
          <div data-xh-part="item" value="apple">
            <span data-xh-part="item-text">苹果</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="banana">
            <span data-xh-part="item-text">香蕉</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="tomato">
            <span data-xh-part="item-text">番茄</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="potato">
            <span data-xh-part="item-text">土豆</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-cascader>

<script type="module">
  const cascader = document.getElementById("cascader-multiple");
  cascader.collection = [
    {
      value: "fruit",
      label: "水果",
      children: [
        { value: "apple", label: "苹果" },
        { value: "banana", label: "香蕉" },
      ],
    },
    {
      value: "vegetable",
      label: "蔬菜",
      children: [
        { value: "tomato", label: "番茄" },
        { value: "potato", label: "土豆" },
      ],
    },
  ];

  cascader.value = [["fruit", "apple"]];

  cascader.addEventListener("value-change", (event) => {
    cascader.value = event.detail.value;
  });
<\/script>
`;export{a as default};
