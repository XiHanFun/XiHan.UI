const e=`<!-- 行评论 | commentable 在每行正文前给一颗评论钮，点它报出 comment-request；挂在 commentLines 里的行在代码下方铺出评论容器，内容由 comment 插槽写 -->
<xh-diff-view id="diff-view-comments" commentable>
  <div data-xh-part="root">
    <div data-xh-part="header">
      <span>src/client.ts</span>
      <span data-xh-part="summary" data-change="added"></span>
      <span data-xh-part="summary" data-change="removed"></span>
    </div>
    <div data-xh-part="viewport">
      <div data-xh-part="body"></div>
    </div>
  </div>
</xh-diff-view>

<script type="module">
  // 真实应用里这份模型来自 computeTextDiff
  const view = document.getElementById("diff-view-comments");
  view.model = {
    hunks: [{
      header: "@@ -1,3 +1,4 @@",
      oldStart: 1,
      oldLines: 3,
      newStart: 1,
      newLines: 4,
      lines: [
        { change: "removed", oldNumber: 1, text: "export function createClient(base: string) {" },
        { change: "removed", oldNumber: 2, text: "  return fetchJson(base, { timeout: 5000 })" },
        {
          change: "added",
          newNumber: 1,
          text: "export function createClient(base: string, token?: string) {",
          segments: [
            { text: "export function createClient(base: string", changed: false },
            { text: ", token?: string", changed: true },
            { text: ") {", changed: false },
          ],
        },
        { change: "added", newNumber: 2, text: "  const headers = token ? { authorization: token } : {}" },
        { change: "added", newNumber: 3, text: "  return fetchJson(base, { timeout: 30000, headers })" },
        { change: "context", oldNumber: 3, newNumber: 4, text: "}" },
      ],
    }],
  };

  const keyOf = ref => \`\${ref.side}:\${ref.line}\`;
  // 已有的评论，一行一条；draft 是正在写的那一条
  const comments = new Map([["new:3", "超时从 5 秒放到 30 秒，网关那边的超时也要一起改。"]]);
  let draft = null;

  function sync() {
    const lines = [...comments.keys()].map((key) => {
      const [side, line] = key.split(":");
      return { side, line: Number(line) };
    });
    if (draft && !comments.has(keyOf(draft)))
      lines.push(draft);
    view.commentLines = lines;
  }

  // 评论容器由元素铺，内容由这里放：写着的那一行放输入框，其余放评论正文
  function fill(element, ref) {
    if (!draft || keyOf(draft) !== keyOf(ref)) {
      element.textContent = comments.get(keyOf(ref)) ?? "";
      return;
    }
    element.innerHTML = \`
      <div style="display: grid; gap: 8px">
        <xh-text-field>
          <div data-xh-part="root">
            <label data-xh-part="label">\${ref.side === "old" ? "旧" : "新"}第 \${ref.line} 行的评论</label>
            <div data-xh-part="control"><input data-xh-part="input" /></div>
          </div>
        </xh-text-field>
        <div style="display: flex; gap: 8px">
          <xh-button size="sm"><button data-xh-part="root" data-action="save">保存</button></xh-button>
          <xh-button size="sm" variant="ghost"><button data-xh-part="root" data-action="cancel">取消</button></xh-button>
        </div>
      </div>\`;
    const input = element.querySelector("input");
    input.value = comments.get(keyOf(ref)) ?? "";
    element.querySelector('[data-action="save"]').addEventListener("click", () => {
      if (input.value.trim() !== "")
        comments.set(keyOf(ref), input.value.trim());
      draft = null;
      refill();
    });
    element.querySelector('[data-action="cancel"]').addEventListener("click", () => {
      draft = null;
      refill();
    });
  }

  // 已经铺着的容器不会再派发 comment-mount：开合编辑时把它们的内容重填一遍
  function refill() {
    sync();
    for (const element of view.querySelectorAll('[data-part="comment-thread"]')) {
      const [side, line] = element.dataset.value.split(":");
      fill(element, { side, line: Number(line) });
    }
  }

  view.addEventListener("comment-mount", event => fill(event.detail.element, event.detail));
  view.addEventListener("comment-request", (event) => {
    draft = { side: event.detail.side, line: event.detail.line };
    refill();
  });
  sync();
<\/script>
`;export{e as default};
