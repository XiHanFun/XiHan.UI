const t=`<!-- 选择模式 | selection-mode 直接指定三种模式，extended 是「单击换一条、Ctrl 与 Shift 才扩选」 -->
<xh-listbox id="listbox-extended" value="a" selection-mode="extended">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">文件（extended）</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="a">
        <span data-xh-part="item-text">report.pdf</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="b">
        <span data-xh-part="item-text">cover.png</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="c">
        <span data-xh-part="item-text">notes.md</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="d">
        <span data-xh-part="item-text">data.csv</span>
        <span data-xh-part="item-indicator"></span>
      </div>
    </div>
  </div>
</xh-listbox>
<p>已选：<span id="listbox-extended-value">a</span></p>

<script type="module">
  // 受控：选中集合写回后再回显
  const listbox = document.getElementById("listbox-extended");
  const readout = document.getElementById("listbox-extended-value");
  listbox.addEventListener("value-change", (event) => {
    listbox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{t as default};
