const n=`<!-- 对话页 | 一条回复里同时摆着思考过程、工具调用、流式正文、代码块与批准闸门，外面是消息流与提示输入框 -->
<div
  id="chat-page"
  style="
    display: flex;
    flex-direction: column;
    gap: var(--xh-space-3);
    inline-size: 100%;
    block-size: 520px;
  "
>
  <xh-message-feed id="chat-page-feed" count="2" style="flex: 1; min-block-size: 0">
    <!-- 宿主是消息流那一格，滚动发生在它里面：根节点得撑满这一格，视口才有可滚的余量 -->
    <div data-xh-part="root" style="block-size: 100%">
      <div data-xh-part="viewport">
        <div data-xh-part="list">
          <article data-xh-part="item" item-id="q1" item-index="0" item-role="user">
            <span data-xh-part="item-label">
              <span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
                <xh-avatar size="sm">
                  <span data-xh-part="root">
                    <span data-xh-part="fallback">我</span>
                  </span>
                </xh-avatar>
                我
              </span>
            </span>
            <p style="margin: 0">关掉浮层时焦点要还给触发器，这条改动动了哪些地方？</p>
          </article>

          <article data-xh-part="item" item-id="a1" item-index="1" item-role="assistant">
            <span data-xh-part="item-label">
              <span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
                <xh-avatar size="sm">
                  <span data-xh-part="root">
                    <span data-xh-part="fallback">曦</span>
                  </span>
                </xh-avatar>
                助手
                <xh-tag size="sm" variant="subtle">
                  <span data-xh-part="root">
                    <span data-xh-part="label">已完成</span>
                  </span>
                </xh-tag>
              </span>
            </span>

            <!-- 一条回复里的五件东西竖着排，节奏由同一个间距档定 -->
            <div style="display: flex; flex-direction: column; gap: var(--xh-space-3)">
              <!-- 想完了：给了起止时刻，名字位自己写成「想了几秒」 -->
              <xh-reasoning id="chat-page-reasoning" start-time="0" end-time="2400">
                <div data-xh-part="root">
                  <button data-xh-part="trigger">
                    <span data-xh-part="indicator"></span>
                    <span data-xh-part="label">思考过程</span>
                  </button>
                  <div data-xh-part="content">
                    先确认约束：只读一次文件、不改公开面。再看还焦点这条走的是哪个通路。
                  </div>
                </div>
              </xh-reasoning>

              <xh-tool-call phase="output-available">
                <div data-xh-part="root">
                  <button data-xh-part="trigger">
                    <span data-xh-part="indicator"></span>
                    <span data-xh-part="label">grep</span>
                    <span data-xh-part="status"></span>
                  </button>
                  <div data-xh-part="content">
                    <div data-xh-part="output">
                      命中 3 处：dialog、drawer、popover 各一处还焦点。
                    </div>
                  </div>
                </div>
              </xh-tool-call>

              <xh-markdown-stream id="chat-page-stream" style="inline-size: 100%">
                <div data-xh-part="root">
                  <div data-xh-part="content"></div>
                </div>
              </xh-markdown-stream>

              <xh-code-view
                id="chat-page-code"
                code-lang="typescript"
                filename="on-close.ts"
                complete
                style="inline-size: 100%"
              >
                <div data-xh-part="root">
                  <div data-xh-part="header">
                    <span data-xh-part="filename">on-close.ts</span>
                    <span data-xh-part="lang-label">typescript</span>
                  </div>
                  <!-- 行由元素铺；这里写的原文是 JS 到达之前的样子 -->
                  <pre data-xh-part="pre"><code data-xh-part="code">export function onClose(reason: CloseReason) {
  if (reason === "escape") return restoreFocus()
  return dismiss()
}</code></pre>
                </div>
              </xh-code-view>

              <!-- 闸门常驻在回复末尾：必选项没勾满就批不了 -->
              <xh-approval id="chat-page-approval" tone="warning">
                <div data-xh-part="root">
                  <h3 data-xh-part="title">要动你的工作区</h3>
                  <p data-xh-part="description">写回前先确认这两条范围。</p>
                  <div data-xh-part="group">
                    <div
                      data-xh-part="item"
                      scope-value="read"
                      scope-label="读 src/ 下的文件"
                      scope-required
                    >
                      <span data-xh-part="item-indicator" scope-value="read"></span>
                      <span data-xh-part="item-text" scope-value="read">读 src/ 下的文件</span>
                    </div>
                    <div data-xh-part="item" scope-value="write" scope-label="把这段改动写回去">
                      <span data-xh-part="item-indicator" scope-value="write"></span>
                      <span data-xh-part="item-text" scope-value="write">把这段改动写回去</span>
                    </div>
                  </div>
                  <!-- 升级前先自己收起：属性由连接层接管，判定落定后自动撤掉 -->
                  <div data-xh-part="result" hidden></div>
                  <div data-xh-part="footer">
                    <button data-xh-part="approve-trigger">批准</button>
                    <button data-xh-part="deny-trigger">拒绝</button>
                  </div>
                  <div data-xh-part="live-region"></div>
                </div>
              </xh-approval>
            </div>
          </article>
        </div>
      </div>
      <button data-xh-part="scroll-to-end-trigger">↓</button>
    </div>
  </xh-message-feed>

  <xh-prompt-input id="chat-page-input">
    <div data-xh-part="root">
      <textarea data-xh-part="input" rows="1" placeholder="接着问点什么…"></textarea>
      <button data-xh-part="submit-trigger">发送</button>
    </div>
  </xh-prompt-input>

  <p
    id="chat-page-note"
    hidden
    style="margin: 0; color: var(--xh-fg-muted); font-size: var(--xh-font-size-sm)"
  ></p>
</div>

<script type="module">
  const stage = document.getElementById("chat-page");
  const feed = stage.querySelector("#chat-page-feed");
  // 角色节点的 id 归元素所有（可及关系靠它接线），作者要认这些节点只能按部件名取
  const list = feed.querySelector('[data-xh-part="list"]');
  const reasoning = stage.querySelector("#chat-page-reasoning");
  const stream = stage.querySelector("#chat-page-stream");
  const codeView = stage.querySelector("#chat-page-code");
  const approval = stage.querySelector("#chat-page-approval");
  const result = approval.querySelector('[data-xh-part="result"]');
  const input = stage.querySelector("#chat-page-input");
  const note = stage.querySelector("#chat-page-note");

  // 文案是对象，只走 property；{seconds} 由元素代入
  reasoning.translations = { label: "思考过程", thoughtFor: "想了 {seconds} 秒" };
  // 状态文案由元素算好，作者把它写进名字位
  reasoning.querySelector('[data-xh-part="label"]').textContent = reasoning.statusText;

  // 正文是一串已渲好的块，只走 property；真实应用里这份数组来自
  // @xihan-ui/markdown 的 createStreamRenderer().render(全文)，这份示例没有打包器，直接写它的产出
  stream.blocks = [
    {
      key: "0:a",
      kind: "markdown",
      html: "<p>按你给的约束，改动落在<strong>一个文件</strong>里：</p>",
      complete: true,
    },
    {
      key: "1:b",
      kind: "markdown",
      html: "<ul>\\n<li>事件仍从内核发出，视图不新增状态</li>\\n<li>退场那一档交给动效令牌，组件里不写时长</li>\\n</ul>",
      complete: true,
    },
  ];

  codeView.code = \`export function onClose(reason: CloseReason) {
  if (reason === "escape") return restoreFocus()
  return dismiss()
}\`;

  // 授权项是数组，只走 property
  approval.scopes = [
    { value: "read", label: "读 src/ 下的文件", required: true },
    { value: "write", label: "把这段改动写回去" },
  ];

  approval.addEventListener("decision", (event) => {
    const decided = event.detail.decision === "approved" ? "已批准" : "已拒绝";
    result.textContent = decided;
    note.textContent = \`批准闸门：\${decided}\`;
    note.hidden = false;
  });

  input.translations = { input: "接着问点什么" };

  // 提示输入框收下的话直接追加成一条消息，不接真实模型
  let count = 2;
  input.addEventListener("submit", (event) => {
    const item = document.createElement("article");
    item.setAttribute("data-xh-part", "item");
    item.setAttribute("item-id", \`q\${count}\`);
    item.setAttribute("item-index", String(count));
    item.setAttribute("item-role", "user");

    const label = document.createElement("span");
    label.setAttribute("data-xh-part", "item-label");
    label.innerHTML = \`<span style="display: inline-flex; align-items: center; gap: var(--xh-space-2)">
      <xh-avatar size="sm"><span data-xh-part="root"><span data-xh-part="fallback">我</span></span></xh-avatar>
      我
    </span>\`;
    const text = document.createElement("p");
    text.style.margin = "0";
    text.textContent = event.detail.value;

    item.append(label, text);
    list.append(item);
    count += 1;
    feed.setAttribute("count", String(count));
  });
<\/script>
`;export{n as default};
