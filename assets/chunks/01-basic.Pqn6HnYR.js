const a=`<!-- 基础用法 | 方向键只搬焦点，Enter 或空格才落值；整组只占一个 Tab 位 -->
<xh-listbox id="listbox-basic" value="beijing">
  <div data-xh-part="root" style="max-inline-size: 320px">
    <span data-xh-part="label">城市</span>
    <div data-xh-part="content">
      <div data-xh-part="item" value="beijing">
        <span data-xh-part="item-text">Beijing 北京</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="berlin">
        <span data-xh-part="item-text">Berlin 柏林</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="busan" aria-disabled="true">
        <span data-xh-part="item-text">Busan 釜山（禁用）</span>
        <span data-xh-part="item-indicator"></span>
      </div>
      <div data-xh-part="item" value="london">
        <span data-xh-part="item-text">London 伦敦</span>
        <span data-xh-part="item-indicator"></span>
      </div>
    </div>
  </div>
</xh-listbox>
<p>已选：<span id="listbox-basic-value">beijing</span></p>

<script type="module">
  // 受控：选中集合写回后再回显
  const listbox = document.getElementById("listbox-basic");
  const readout = document.getElementById("listbox-basic-value");
  listbox.addEventListener("value-change", (event) => {
    listbox.value = event.detail.value;
    readout.textContent = event.detail.value.join("、") || "（无）";
  });
<\/script>
`;export{a as default};
