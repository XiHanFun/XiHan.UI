const a=`<!-- 形态 | variant 只改触发框的底色与描边用法，浮层与列不跟着变 -->
<div id="cascader-variant" style="display: grid; gap: 16px; justify-items: start">
  <xh-cascader variant="outline" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">outline</span>
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="column" level="0">
            <div data-xh-part="item" value="zhejiang">
              <span data-xh-part="item-text">浙江</span>
            </div>
            <div data-xh-part="item" value="jiangsu">
              <span data-xh-part="item-text">江苏</span>
            </div>
          </div>
          <div data-xh-part="column" level="1">
            <div data-xh-part="item" value="hangzhou">
              <span data-xh-part="item-text">杭州</span>
            </div>
            <div data-xh-part="item" value="ningbo">
              <span data-xh-part="item-text">宁波</span>
            </div>
            <div data-xh-part="item" value="nanjing">
              <span data-xh-part="item-text">南京</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-cascader>

  <xh-cascader variant="subtle" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">subtle</span>
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="column" level="0">
            <div data-xh-part="item" value="zhejiang">
              <span data-xh-part="item-text">浙江</span>
            </div>
            <div data-xh-part="item" value="jiangsu">
              <span data-xh-part="item-text">江苏</span>
            </div>
          </div>
          <div data-xh-part="column" level="1">
            <div data-xh-part="item" value="hangzhou">
              <span data-xh-part="item-text">杭州</span>
            </div>
            <div data-xh-part="item" value="ningbo">
              <span data-xh-part="item-text">宁波</span>
            </div>
            <div data-xh-part="item" value="nanjing">
              <span data-xh-part="item-text">南京</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-cascader>

  <xh-cascader variant="ghost" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">ghost</span>
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="column" level="0">
            <div data-xh-part="item" value="zhejiang">
              <span data-xh-part="item-text">浙江</span>
            </div>
            <div data-xh-part="item" value="jiangsu">
              <span data-xh-part="item-text">江苏</span>
            </div>
          </div>
          <div data-xh-part="column" level="1">
            <div data-xh-part="item" value="hangzhou">
              <span data-xh-part="item-text">杭州</span>
            </div>
            <div data-xh-part="item" value="ningbo">
              <span data-xh-part="item-text">宁波</span>
            </div>
            <div data-xh-part="item" value="nanjing">
              <span data-xh-part="item-text">南京</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-cascader>
</div>

<script type="module">
  // 三份形态共用同一份树数据
  const scope = document.getElementById("cascader-variant");
  const regions = [
    {
      value: "zhejiang",
      label: "浙江",
      children: [
        { value: "hangzhou", label: "杭州" },
        { value: "ningbo", label: "宁波" },
      ],
    },
    {
      value: "jiangsu",
      label: "江苏",
      children: [{ value: "nanjing", label: "南京" }],
    },
  ];
  for (const cascader of scope.querySelectorAll("xh-cascader")) {
    cascader.collection = regions;
  }
<\/script>
`;export{a as default};
