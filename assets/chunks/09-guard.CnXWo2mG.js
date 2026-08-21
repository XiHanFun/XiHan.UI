const t=`<!-- 拦截切换 | 受控下 value-change 只是意图，宿主校验不过就不写回 value，标签页原地不动 -->
<div style="display: flex; flex-direction: column; gap: 12px; inline-size: 100%">
  <xh-tabs id="tabs-guard" value="draft">
    <div data-xh-part="root">
      <div data-xh-part="list">
        <button data-xh-part="trigger" value="draft">草稿</button>
        <button data-xh-part="trigger" value="preview">预览</button>
        <button data-xh-part="trigger" value="publish">发布</button>
      </div>

      <div data-xh-part="content" value="draft">草稿面板：内容改过还没保存。</div>
      <div data-xh-part="content" value="preview">预览面板。</div>
      <div data-xh-part="content" value="publish">发布面板。</div>
    </div>
  </xh-tabs>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-button id="tabs-guard-save" variant="outline">
      <button data-xh-part="root">保存草稿</button>
    </xh-button>
    <span id="tabs-guard-notice">当前：draft</span>
  </div>
</div>

<script type="module">
  // 切换意图先过这一关，草稿没保存就不写回 value
  const tabs = document.getElementById("tabs-guard");
  const notice = document.getElementById("tabs-guard-notice");
  const save = document.getElementById("tabs-guard-save");
  let dirty = true;

  tabs.addEventListener("value-change", (event) => {
    if (dirty) {
      notice.textContent = "草稿还没保存，切不过去";
      return;
    }
    tabs.value = event.detail.value ?? tabs.value;
    notice.textContent = \`当前：\${tabs.value}\`;
  });

  save.addEventListener("click", () => {
    dirty = false;
    save.disabled = true;
    notice.textContent = "已保存，现在可以切走了";
  });
<\/script>
`;export{t as default};
