var e=`<!-- 多文件 | parseUnifiedPatch 把一份多文件补丁拆成每个文件一份模型；逐份放进折叠面板，标题栏写路径与增删数，差异视图不再写头部，表格直接以路径为名 -->
<div style="display: grid; gap: 8px; inline-size: 100%">
  <span>2 个文件，+3 −2</span>
  <xh-accordion id="diff-view-multi-file" multiple>
    <div data-xh-part="root">
      <div data-xh-part="item" value="src/client.ts">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>src/client.ts</span>
            <span style="display: flex; align-items: center; gap: 8px">
              <span>+2 −1</span>
              <span data-xh-part="indicator"></span>
            </span>
          </button>
        </h3>
        <div data-xh-part="content">
          <xh-diff-view data-file="src/client.ts">
            <div data-xh-part="root">
              <div data-xh-part="viewport"><div data-xh-part="body"></div></div>
            </div>
          </xh-diff-view>
        </div>
      </div>
      <div data-xh-part="item" value="src/retry.ts">
        <h3 data-xh-part="header">
          <button data-xh-part="trigger">
            <span>src/retry.ts</span>
            <span style="display: flex; align-items: center; gap: 8px">
              <span>+1 −1</span>
              <span data-xh-part="indicator"></span>
            </span>
          </button>
        </h3>
        <div data-xh-part="content">
          <xh-diff-view data-file="src/retry.ts">
            <div data-xh-part="root">
              <div data-xh-part="viewport"><div data-xh-part="body"></div></div>
            </div>
          </xh-diff-view>
        </div>
      </div>
    </div>
  </xh-accordion>
</div>

<script type="module">
  // 真实应用里这两份模型来自 parseUnifiedPatch(补丁)，路径已去掉 a/ b/ 前缀
  const models = {
    "src/client.ts": {
      oldPath: "src/client.ts",
      newPath: "src/client.ts",
      hunks: [{
        header: "@@ -1,3 +1,4 @@",
        oldStart: 1,
        oldLines: 3,
        newStart: 1,
        newLines: 4,
        lines: [
          { change: "context", oldNumber: 1, newNumber: 1, text: "export function createClient(base: string) {" },
          { change: "removed", oldNumber: 2, text: "  return fetchJson(base, { timeout: 5000 })" },
          { change: "added", newNumber: 2, text: "  const headers = { accept: \\"application/json\\" }" },
          { change: "added", newNumber: 3, text: "  return fetchJson(base, { timeout: 30000, headers })" },
          { change: "context", oldNumber: 3, newNumber: 4, text: "}" },
        ],
      }],
    },
    "src/retry.ts": {
      oldPath: "src/retry.ts",
      newPath: "src/retry.ts",
      hunks: [{
        header: "@@ -1,4 +1,4 @@",
        oldStart: 1,
        oldLines: 4,
        newStart: 1,
        newLines: 4,
        lines: [
          {
            change: "removed",
            oldNumber: 1,
            text: "export const MAX_RETRIES = 3",
            segments: [{ text: "export const MAX_RETRIES = ", changed: false }, { text: "3", changed: true }],
          },
          {
            change: "added",
            newNumber: 1,
            text: "export const MAX_RETRIES = 5",
            segments: [{ text: "export const MAX_RETRIES = ", changed: false }, { text: "5", changed: true }],
          },
          { change: "context", oldNumber: 2, newNumber: 2, text: "export function shouldRetry(status: number) {" },
          { change: "context", oldNumber: 3, newNumber: 3, text: "  return status >= 500" },
          { change: "context", oldNumber: 4, newNumber: 4, text: "}" },
        ],
      }],
    },
  };
  for (const view of document.querySelectorAll("#diff-view-multi-file xh-diff-view"))
    view.model = models[view.dataset.file];

  // 展开集合是数组，只走 property：一开始全部展开，每次变更写回
  const accordion = document.getElementById("diff-view-multi-file");
  accordion.value = Object.keys(models);
  accordion.addEventListener("value-change", (event) => {
    accordion.value = event.detail.value;
  });
<\/script>
`;export{e as default};