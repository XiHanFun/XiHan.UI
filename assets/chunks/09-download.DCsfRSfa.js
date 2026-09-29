const e=`<!-- 头部下载 | 下载交给下载触发器：放进头部条，文件名沿用代码的文件名，写出的是原文 -->
<xh-code-view id="code-view-download" code-lang="typescript" filename="retry.ts" complete style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="header">
      <!-- 文件名占满剩余宽度，下载按钮自然被推到头部条末端 -->
      <span data-xh-part="filename">retry.ts</span>
      <!-- 嵌套的 xh-* 子树由外层元素跳过，两个宿主各接各的角色节点 -->
      <xh-download-trigger id="code-view-download-trigger" file-name="retry.ts" variant="ghost" size="sm">
        <button data-xh-part="root">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10L12 15L17 10"/><path d="M12 3V15"/></svg>
          下载
        </button>
      </xh-download-trigger>
    </div>
    <pre data-xh-part="pre"><code data-xh-part="code"></code></pre>
  </div>
</xh-code-view>

<script type="module">
  // 同一份原文交给两个元素：代码视图铺行，下载触发器写文件
  const sample = \`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < times; i++) {
    try {
      return await run()
    }
    catch (error) {
      last = error
    }
  }
  throw last
}\`;
  document.getElementById("code-view-download").code = sample;
  document.getElementById("code-view-download-trigger").data = sample;
<\/script>
`;export{e as default};
