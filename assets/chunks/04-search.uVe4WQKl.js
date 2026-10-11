var e=`<!-- 跟随输入高亮 | 关键词逐字符比对、不拼入正则，输入 . * ( 等字符也只作为普通字符查找 -->
<div id="highlight-search" style="display: flex; flex-direction: column; gap: 12px">
  <xh-text-field id="highlight-search-input" default-value="1.0" placeholder="输入关键词">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <input data-xh-part="input" aria-label="关键词" />
      </div>
    </div>
  </xh-text-field>

  <xh-highlight text="曦寒 UI 1.0 发布说明" keyword="1.0">
    <span data-xh-part="root"></span>
  </xh-highlight>
  <xh-highlight text="版本 120 的兼容性清单" keyword="1.0">
    <span data-xh-part="root"></span>
  </xh-highlight>
  <xh-highlight text="取值写作 a*b 时的转义规则" keyword="1.0">
    <span data-xh-part="root"></span>
  </xh-highlight>
</div>

<script type="module">
  // 输入框里的原串直接交给三行，敲进去什么就找什么
  const box = document.getElementById("highlight-search");
  const field = document.getElementById("highlight-search-input");
  const rows = box.querySelectorAll("xh-highlight");

  field.addEventListener("value-change", (event) => {
    for (const row of rows) row.keyword = event.detail.value;
  });
<\/script>
`;export{e as default};