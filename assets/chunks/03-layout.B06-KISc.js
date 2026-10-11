var e=`<!-- 竖排布局与兜底字形 | 写一层输入行，root 即切换为竖排：输入行在上、动作行在下；按钮留空时皮肤按身份绘制箭头或停止方块 -->
<xh-prompt-input id="prompt-input-layout">
  <div data-xh-part="root">
    <div data-xh-part="control">
      <textarea data-xh-part="input" rows="1" placeholder="给助手写点什么…"></textarea>
      <button data-xh-part="submit-trigger"></button>
    </div>
    <div style="display: flex; align-items: center; gap: 12px; font-size: 12px">
      <xh-checkbox id="prompt-input-layout-loading" size="sm">
        <label data-xh-part="label">
          <button data-xh-part="root">
            <span data-xh-part="indicator"></span>
          </button>
          <span data-xh-part="text">生成中</span>
        </label>
      </xh-checkbox>
      <xh-select id="prompt-input-layout-key" default-value="enter" size="sm">
        <div data-xh-part="root">
          <div data-xh-part="control">
            <button data-xh-part="trigger">
              <span data-xh-part="value-text"></span>
              <span data-xh-part="indicator"></span>
            </button>
          </div>
          <div data-xh-part="positioner">
            <div data-xh-part="content">
              <div data-xh-part="list">
                <div data-xh-part="item" value="enter">
                  <span data-xh-part="item-text">Enter 提交</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
                <div data-xh-part="item" value="mod-enter">
                  <span data-xh-part="item-text">Ctrl/Cmd+Enter 提交</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
                <div data-xh-part="item" value="none">
                  <span data-xh-part="item-text">只用按钮提交</span>
                  <span data-xh-part="item-indicator"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </xh-select>
      <span id="prompt-input-layout-count" style="margin-inline-start: auto">0 字</span>
    </div>
  </div>
</xh-prompt-input>
<p id="prompt-input-layout-sent" data-demo-output>已发出：（无）</p>

<script type="module">
  const input = document.getElementById("prompt-input-layout");
  const loading = document.getElementById("prompt-input-layout-loading");
  const key = document.getElementById("prompt-input-layout-key");
  const count = document.getElementById("prompt-input-layout-count");
  const line = document.getElementById("prompt-input-layout-sent");
  const sent = [];
  input.translations = { input: "给助手写点什么" };

  input.addEventListener("value-change", (event) => {
    count.textContent = \`\${event.detail.value.length} 字\`;
  });

  // submit 与原生表单提交同名，故不冒泡，直接在元素上监听
  input.addEventListener("submit", (event) => {
    sent.push(event.detail.value);
    line.textContent = \`已发出：\${sent.join(" / ")}\`;
  });

  // 生成中受控：勾选与停止都经这里写回
  function setLoading(next) {
    loading.checked = next;
    input.toggleAttribute("loading", next);
  }

  setLoading(false);
  input.addEventListener("stop", () => setLoading(false));
  loading.addEventListener("checked-change", (event) => setLoading(event.detail.checked));

  // 选择器的 value-change 会冒泡到输入框上，与输入框自己的值变化同名，这里截住
  key.addEventListener("value-change", (event) => {
    event.stopPropagation();
    input.setAttribute("submit-key", event.detail.value[0]);
  });
<\/script>
`;export{e as default};