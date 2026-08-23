const a=`<!-- 尺寸 | 不传 size 即默认档；触发框与列里的条目一起换档 -->
<div
  id="cascader-size"
  style="display: flex; flex-wrap: wrap; align-items: flex-end; gap: 16px"
>
  <xh-cascader size="sm" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
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

  <!-- 中间一档不写 size -->
  <xh-cascader placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">默认</span>
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
  <xh-cascader size="lg" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
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
  // 三个尺寸档共用同一份树数据
  const scope = document.getElementById("cascader-size");
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
