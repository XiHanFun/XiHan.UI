const a=`<!-- 搜索过滤 | searchable 给每侧配一个搜索框，筛剩下的才参与方向键、全选与搬运 -->
<div id="transfer-search" style="inline-size: 100%; max-inline-size: 520px">
  <xh-transfer searchable>
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <!-- 搜索框没有可见标签，借本侧标题当可及名字，标题因此不能省 -->
          <span data-xh-part="panel-title">待选城市</span>
          <span data-xh-part="panel-count"></span>
          <button data-xh-part="select-all-trigger">全选</button>
        </div>
        <input data-xh-part="search" placeholder="搜索，也认 beijing" />
        <div data-xh-part="list">
          <div data-xh-part="item" value="beijing">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">北京</span>
          </div>
          <div data-xh-part="item" value="shanghai">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">上海</span>
          </div>
          <div data-xh-part="item" value="guangzhou">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">广州</span>
          </div>
          <div data-xh-part="item" value="shenzhen">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">深圳</span>
          </div>
          <div data-xh-part="item" value="hangzhou">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">杭州</span>
          </div>
          <div data-xh-part="item" value="chengdu">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">成都</span>
          </div>
          <div data-xh-part="item" value="wuhan">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">武汉</span>
          </div>
          <div data-xh-part="item" value="xian">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">西安</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger">›</button>
      <button data-xh-part="to-source-trigger">‹</button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选城市</span>
          <span data-xh-part="panel-count"></span>
          <button data-xh-part="select-all-trigger">全选</button>
        </div>
        <input data-xh-part="search" placeholder="搜索" />
        <div data-xh-part="list">
          <div data-xh-part="item" value="beijing">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">北京</span>
          </div>
          <div data-xh-part="item" value="shanghai">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">上海</span>
          </div>
          <div data-xh-part="item" value="guangzhou">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">广州</span>
          </div>
          <div data-xh-part="item" value="shenzhen">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">深圳</span>
          </div>
          <div data-xh-part="item" value="hangzhou">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">杭州</span>
          </div>
          <div data-xh-part="item" value="chengdu">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">成都</span>
          </div>
          <div data-xh-part="item" value="wuhan">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">武汉</span>
          </div>
          <div data-xh-part="item" value="xian">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">西安</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  const stage = document.getElementById("transfer-search");
  const transfer = stage.querySelector("xh-transfer");

  transfer.collection = [
    { value: "beijing", label: "北京" },
    { value: "shanghai", label: "上海" },
    { value: "guangzhou", label: "广州" },
    { value: "shenzhen", label: "深圳" },
    { value: "hangzhou", label: "杭州" },
    { value: "chengdu", label: "成都" },
    { value: "wuhan", label: "武汉" },
    { value: "xian", label: "西安" },
  ];

  // 默认按标签大小写不敏感包含匹配，这里换成同时认拼音代号
  transfer.filter = (item, query) =>
    item.label.includes(query) || item.value.includes(query.toLowerCase());

  transfer.value = [];
  transfer.addEventListener("value-change", (event) => {
    transfer.value = event.detail.value;
  });
<\/script>
`;export{a as default};
