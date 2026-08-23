const t=`<!-- 命令式聚焦 | 触发器就是你写的那个按钮，focus 与 blur 直接调它 -->
<xh-select id="select-focus" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">优先级</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="p0">
            <span data-xh-part="item-text">紧急</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="p1">
            <span data-xh-part="item-text">高</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="p2">
            <span data-xh-part="item-text">普通</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
<div style="display: flex; gap: 8px; margin-block-start: 8px">
  <xh-button variant="outline" size="sm">
    <button data-xh-part="root" id="select-focus-submit">提交</button>
  </xh-button>
  <xh-button variant="ghost" size="sm">
    <button data-xh-part="root" id="select-focus-blur">移开焦点</button>
  </xh-button>
</div>
<p id="select-focus-tip" style="color: var(--xh-fg-danger)" hidden>
  还没选优先级，焦点已回到选择器
</p>

<script type="module">
  const select = document.getElementById("select-focus");
  const trigger = select.querySelector('[data-xh-part="trigger"]');
  const tip = document.getElementById("select-focus-tip");
  let picked = [];

  select.addEventListener("value-change", (event) => {
    picked = event.detail.value;
    tip.hidden = true;
  });

  // 提交时没选值就把焦点送回触发器
  document.getElementById("select-focus-submit").addEventListener("click", () => {
    if (picked.length > 0) return;
    tip.hidden = false;
    trigger.focus();
  });

  document.getElementById("select-focus-blur").addEventListener("click", () => {
    trigger.blur();
  });
<\/script>
`;export{t as default};
