const t=`<!-- 基础用法 | 搜索并选择城市 -->
<xh-combobox id="combobox-basic" open-on-click placeholder="搜索城市">
  <div data-xh-part="root">
    <label data-xh-part="label">城市</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger"></button>
      <button data-xh-part="clear-trigger"></button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="berlin">
          <span data-xh-part="item-text">Berlin 柏林</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="bern">
          <span data-xh-part="item-text">Bern 伯尔尼</span>
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
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>

<script type="module">
  const combobox = document.getElementById("combobox-basic");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

<\/script>
`;export{t as default};
