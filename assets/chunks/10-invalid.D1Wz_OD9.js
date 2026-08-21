const n=`<!-- 校验状态 | invalid 让输入行报 aria-invalid、描边转告警色；选出值后判定自己撤掉 -->
<xh-combobox id="combobox-invalid" invalid open-on-click placeholder="必须选一个城市">
  <div data-xh-part="root">
    <label data-xh-part="label">常驻城市</label>
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
        <div data-xh-part="item" value="chengdu">
          <span data-xh-part="item-text">Chengdu 成都</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="empty">无匹配城市</div>
    </div>
  </div>
</xh-combobox>
<p id="combobox-invalid-hint" style="color: var(--xh-fg-danger)">这一项必填</p>

<script type="module">
  const combobox = document.getElementById("combobox-invalid");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const hint = document.getElementById("combobox-invalid-hint");
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
  });

  // 校验归宿主，组件只负责把这个结论铺成属性
  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    const invalid = event.detail.value.length === 0;
    combobox.invalid = invalid;
    hint.hidden = !invalid;
  });
<\/script>
`;export{n as default};
