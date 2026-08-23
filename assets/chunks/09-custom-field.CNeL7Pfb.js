const a=`<!-- 后端字段映射 | collection 只认 value / label / disabled / children 这几个名字，后端字段不一致就在进组件前转一道 -->
<xh-cascader id="cascader-custom-field" placeholder="请选择服务区域">
  <div data-xh-part="root">
    <span data-xh-part="label">服务区域</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value="east">
            <span data-xh-part="item-text">华东</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="south">
            <span data-xh-part="item-text">华南</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="column" level="1">
          <div data-xh-part="item" value="shanghai">
            <span data-xh-part="item-text">上海</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="hangzhou">
            <span data-xh-part="item-text">杭州</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="guangzhou">
            <span data-xh-part="item-text">广州</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="shenzhen">
            <span data-xh-part="item-text">深圳</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="column" level="2">
          <div data-xh-part="item" value="pudong">
            <span data-xh-part="item-text">浦东新区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="xuhui">
            <span data-xh-part="item-text">徐汇区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="xihu">
            <span data-xh-part="item-text">西湖区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="tianhe">
            <span data-xh-part="item-text">天河区</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-cascader>
<p>选中的是转换后的 value：<span id="cascader-custom-field-value">（未选）</span></p>

<script type="module">
  // 后端原样返回的树：键名与组件对不上
  const raw = [
    {
      code: "east",
      name: "华东",
      sub: [
        {
          code: "shanghai",
          name: "上海",
          sub: [
            { code: "pudong", name: "浦东新区" },
            { code: "xuhui", name: "徐汇区" },
          ],
        },
        {
          code: "hangzhou",
          name: "杭州",
          sub: [{ code: "xihu", name: "西湖区" }],
        },
      ],
    },
    {
      code: "south",
      name: "华南",
      sub: [
        {
          code: "guangzhou",
          name: "广州",
          sub: [{ code: "tianhe", name: "天河区" }],
        },
        { code: "shenzhen", name: "深圳", frozen: true },
      ],
    },
  ];

  function toNodes(list) {
    return list.map((item) => ({
      value: item.code,
      label: item.name,
      disabled: item.frozen,
      children: item.sub ? toNodes(item.sub) : undefined,
    }));
  }

  const cascader = document.getElementById("cascader-custom-field");
  cascader.collection = toNodes(raw);

  const readout = document.getElementById("cascader-custom-field-value");
  cascader.addEventListener("value-change", (event) => {
    const path = event.detail.value[0];
    readout.textContent = path ? path.join(" / ") : "（未选）";
  });
<\/script>
`;export{a as default};
