var e=`<!-- 浮层内搜索 | searchable 在浮层顶部放一个搜索框，展开即落焦；输入即把树裁到只剩命中的那几枝，命中节点的祖先自动展开，没命中的节点带 hidden 收起；Escape 先清空检索词 -->
<xh-tree-select id="tree-select-search" searchable placeholder="选一个城市">
  <div data-xh-part="root">
    <span data-xh-part="label">投放城市</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <input data-xh-part="input" aria-label="搜索城市" placeholder="搜索城市" />
        <div data-xh-part="tree">
          <div data-xh-part="branch" value="east">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华东</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="sh">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">上海</span>
              </div>
              <div data-xh-part="item" value="hz">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">杭州</span>
              </div>
              <div data-xh-part="item" value="nj">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">南京</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="north">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华北</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="bj">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">北京</span>
              </div>
              <div data-xh-part="item" value="tj">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">天津</span>
              </div>
            </div>
          </div>
          <div data-xh-part="branch" value="south">
            <div data-xh-part="branch-control">
              <span data-xh-part="branch-trigger"></span>
              <span data-xh-part="branch-text">华南</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="branch-content">
              <div data-xh-part="item" value="gz">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">广州</span>
              </div>
              <div data-xh-part="item" value="sz">
                <span data-xh-part="item-indicator"></span>
                <span data-xh-part="item-text">深圳</span>
              </div>
            </div>
          </div>
        </div>
        <!-- 一个都没命中时露面 -->
        <div data-xh-part="empty">没有匹配的城市</div>
      </div>
    </div>
  </div>
</xh-tree-select>

<script type="module">
  // 搜索按这份树数据的 label 匹配，标记只管长相
  const treeSelect = document.getElementById("tree-select-search");
  treeSelect.collection = [
    {
      value: "east",
      label: "华东",
      children: [
        { value: "sh", label: "上海" },
        { value: "hz", label: "杭州" },
        { value: "nj", label: "南京" },
      ],
    },
    {
      value: "north",
      label: "华北",
      children: [
        { value: "bj", label: "北京" },
        { value: "tj", label: "天津" },
      ],
    },
    {
      value: "south",
      label: "华南",
      children: [
        { value: "gz", label: "广州" },
        { value: "sz", label: "深圳" },
      ],
    },
  ];
<\/script>
`;export{e as default};