const t=`<!-- 多行输入宿主 | 输入部件写成 textarea 即多行宿主；此时不写 role 与 aria-expanded，textarea 保留它自带的 textbox 角色 -->
<xh-combobox id="combobox-textarea" allow-custom-value>
  <div data-xh-part="root">
    <label data-xh-part="label">回复内容</label>
    <div data-xh-part="control">
      <!-- 换标签只此一处；键盘、高亮与选中回填的行为一律不变 -->
      <textarea data-xh-part="input" rows="3" placeholder="挑一条常用语，或自己写"></textarea>
      <button data-xh-part="trigger">▾</button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="received">
          <span data-xh-part="item-text">已收到，稍后处理</span>
          <span data-xh-part="item-indicator">✓</span>
        </div>
        <div data-xh-part="item" value="shipping">
          <span data-xh-part="item-text">商品已发出，请注意查收</span>
          <span data-xh-part="item-indicator">✓</span>
        </div>
        <div data-xh-part="item" value="refund">
          <span data-xh-part="item-text">退款已提交，三个工作日内到账</span>
          <span data-xh-part="item-indicator">✓</span>
        </div>
      </div>
    </div>
  </div>
</xh-combobox>
<p>草稿：<span id="combobox-textarea-draft">（空）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-textarea");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const draft = document.getElementById("combobox-textarea-draft");
  const all = [...content.children];
  const labelOf = (item) => item.querySelector('[data-xh-part="item-text"]').textContent.toLowerCase();

  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(...all.filter((item) => labelOf(item).includes(q)));
    draft.textContent = event.detail.inputValue || "（空）";
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
  });
<\/script>
`;export{t as default};
