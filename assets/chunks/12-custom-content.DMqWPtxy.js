const n=`<!-- 候选里的自定义内容 | 条目内容由你写：主文本之外还能带副标题与标记，过滤与键盘行为一点不变 -->
<xh-combobox id="combobox-custom-content" open-on-click placeholder="输入邮箱前缀">
  <div data-xh-part="root">
    <label data-xh-part="label">邮箱</label>
    <div data-xh-part="control">
      <input data-xh-part="input" />
      <button data-xh-part="trigger">▾</button>
      <button data-xh-part="clear-trigger">✕</button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="item" value="gmail" data-label="name@gmail.com">
          <span data-xh-part="item-text">
            <span style="display: inline-flex; align-items: center; gap: 8px">
              name@gmail.com
              <xh-badge variant="subtle" tone="info" size="sm">
                <span data-xh-part="root">国际</span>
              </xh-badge>
            </span>
          </span>
          <span data-xh-part="item-indicator">✓</span>
        </div>
        <div data-xh-part="item" value="qq" data-label="name@qq.com">
          <span data-xh-part="item-text">
            <span style="display: inline-flex; align-items: center; gap: 8px">
              name@qq.com
              <xh-badge variant="subtle" tone="success" size="sm">
                <span data-xh-part="root">国内</span>
              </xh-badge>
            </span>
          </span>
          <span data-xh-part="item-indicator">✓</span>
        </div>
        <div data-xh-part="item" value="163" data-label="name@163.com">
          <span data-xh-part="item-text">
            <span style="display: inline-flex; align-items: center; gap: 8px">
              name@163.com
              <xh-badge variant="subtle" tone="success" size="sm">
                <span data-xh-part="root">国内</span>
              </xh-badge>
            </span>
          </span>
          <span data-xh-part="item-indicator">✓</span>
        </div>
      </div>
      <div data-xh-part="empty">没有匹配的邮箱</div>
    </div>
  </div>
</xh-combobox>
<p>当前值：<span id="combobox-custom-content-value">（未选）</span></p>

<script type="module">
  const combobox = document.getElementById("combobox-custom-content");
  const content = combobox.querySelector('[data-xh-part="content"]');
  const readout = document.getElementById("combobox-custom-content-value");
  const all = [...content.children];

  // 条目里还带着标记文字，过滤只认 data-label 上那份主文本
  combobox.addEventListener("input-value-change", (event) => {
    const q = event.detail.inputValue.trim().toLowerCase();
    content.replaceChildren(
      ...all.filter((item) => item.dataset.label.toLowerCase().includes(q)),
    );
  });

  combobox.addEventListener("value-change", (event) => {
    combobox.value = event.detail.value;
    readout.textContent = event.detail.value[0] ?? "（未选）";
  });
<\/script>
`;export{n as default};
