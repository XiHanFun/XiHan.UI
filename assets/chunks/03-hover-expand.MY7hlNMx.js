const a=`<!-- 悬停展开 | expand-trigger 改成 hover 后，指针划过分支即开子列，只挪展开路径不抢焦点；键盘仍走右方向键 -->
<xh-cascader id="cascader-hover-expand" expand-trigger="hover" placeholder="划过即展开">
  <div data-xh-part="root">
    <span data-xh-part="label">方向</span>
    <button data-xh-part="trigger">
      <span data-xh-part="value-text"></span>
      <span data-xh-part="indicator"></span>
    </button>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="column" level="0">
          <div data-xh-part="item" value="frontend">
            <span data-xh-part="item-text">前端</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="backend">
            <span data-xh-part="item-text">后端</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
        <div data-xh-part="column" level="1">
          <div data-xh-part="item" value="vue">
            <span data-xh-part="item-text">Vue</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="wc">
            <span data-xh-part="item-text">Web Components</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="dotnet">
            <span data-xh-part="item-text">.NET</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="node">
            <span data-xh-part="item-text">Node.js</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-cascader>
<p>当前路径：<span id="cascader-hover-expand-value">（未选）</span></p>

<script type="module">
  const cascader = document.getElementById("cascader-hover-expand");
  cascader.collection = [
    {
      value: "frontend",
      label: "前端",
      children: [
        { value: "vue", label: "Vue" },
        { value: "wc", label: "Web Components" },
      ],
    },
    {
      value: "backend",
      label: "后端",
      children: [
        { value: "dotnet", label: ".NET" },
        { value: "node", label: "Node.js" },
      ],
    },
  ];

  const readout = document.getElementById("cascader-hover-expand-value");
  cascader.addEventListener("value-change", (event) => {
    const path = event.detail.value[0];
    readout.textContent = path ? path.join(" / ") : "（未选）";
  });
<\/script>
`;export{a as default};
