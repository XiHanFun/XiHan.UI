const n=`<!-- 按块折叠 | block-folding 按缩进找出语法块，块头行首给一颗折叠钮；折叠集合写块头的行号，可受控（folded）也可非受控（default-folded）；一组钮只占一个 Tab 位、上下方向键在组内走 -->
<div style="display: grid; gap: 8px; inline-size: 100%">
  <xh-code-view id="code-view-block-folding" code-lang="typescript" complete line-numbers block-folding default-folded="11">
    <div data-xh-part="root">
      <!-- 行与折叠钮都由元素铺 -->
      <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
    </div>
  </xh-code-view>
  <span id="code-view-block-folding-state">折叠着的块头：11</span>
</div>

<script type="module">
  const view = document.getElementById("code-view-block-folding");
  const state = document.getElementById("code-view-block-folding-state");
  view.code = \`export function createQueue<T>(limit: number) {
  const pending: T[] = []

  function push(item: T) {
    if (pending.length >= limit) {
      pending.shift()
    }
    pending.push(item)
  }

  function drain(handle: (item: T) => void) {
    while (pending.length > 0) {
      handle(pending.shift()!)
    }
  }

  return { push, drain }
}\`;
  // 非受控：元素自己记着折叠集合，变化经 folded-change 报出来
  view.addEventListener("folded-change", (event) => {
    const { folded } = event.detail;
    state.textContent = \`折叠着的块头：\${folded.length > 0 ? folded.join("、") : "无"}\`;
  });
<\/script>
`;export{n as default};
