const a=`<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 subtle 形态，只看语气这一轴 -->
<div id="cascader-tone" style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-cascader variant="subtle" tone="brand" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">brand</span>
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

  <xh-cascader variant="subtle" tone="neutral" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">neutral</span>
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

  <xh-cascader variant="subtle" tone="success" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
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

  <xh-cascader variant="subtle" tone="warning" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
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

  <xh-cascader variant="subtle" tone="danger" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
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

  <xh-cascader variant="subtle" tone="info" placeholder="请选择地区">
    <div data-xh-part="root">
      <span data-xh-part="label">info</span>
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
  // 六份语气共用同一份树数据
  const scope = document.getElementById("cascader-tone");
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
