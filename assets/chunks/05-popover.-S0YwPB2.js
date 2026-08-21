const t=`<!-- 弹出式选择 | 把列表装进浮层：触发器显示当前选中项，落值即收起，浮层底部还能放操作按钮 -->
<xh-popover id="listbox-popover" open="false" placement="bottom-start">
  <button data-xh-part="trigger">起风了</button>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <xh-listbox id="listbox-popover-list" value="song1">
        <div data-xh-part="root" style="min-inline-size: 200px">
          <div data-xh-part="content">
            <div data-xh-part="item" value="song1">
              <span data-xh-part="item-text">起风了</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="song2">
              <span data-xh-part="item-text">夜空中最亮的星</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="song3" aria-disabled="true">
              <span data-xh-part="item-text">海阔天空（暂不可选）</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="song4">
              <span data-xh-part="item-text">晴天</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </xh-listbox>
      <xh-button variant="ghost" size="sm">
        <button data-xh-part="root" data-clear>清空</button>
      </xh-button>
    </div>
  </div>
</xh-popover>
<p>已选：<span id="listbox-popover-value">song1</span></p>

<script type="module">
  const popover = document.getElementById("listbox-popover");
  const list = document.getElementById("listbox-popover-list");
  const readout = document.getElementById("listbox-popover-value");
  // 触发器的 id 归连接层写，作者按部件取节点
  const trigger = popover.querySelector('[data-xh-part="trigger"]');

  // 浮层受控：开合写回
  popover.addEventListener("open-change", (event) => {
    popover.open = event.detail.open;
  });

  // 单选：落值即收起浮层，触发器换成当前选中项
  list.addEventListener("value-change", (event) => {
    list.value = event.detail.value;
    const picked = list.querySelector(
      \`[data-xh-part="item"][value="\${event.detail.value[0]}"]\`,
    );
    trigger.textContent = picked ? picked.textContent.trim() : "弹出选择";
    readout.textContent = event.detail.value.join("、") || "（无）";
    if (event.detail.value.length > 0) popover.open = false;
  });

  popover.querySelector("[data-clear]").addEventListener("click", () => {
    list.value = [];
    trigger.textContent = "弹出选择";
    readout.textContent = "（无）";
  });
<\/script>
`;export{t as default};
