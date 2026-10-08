var e=`<!-- 搜索 | search 标出键名与值里含有搜索词的行并展开它们的祖先，命中的那一段铺成 mark；工具条里的上一条 / 下一条在命中之间逐个走，停住的那一条换成实心并滚进视野 -->
<!-- 工具条写在根之前；搜索词经 search 属性交给元素，上一条 / 下一条调用元素的 prevMatch / nextMatch -->
<div style="inline-size: 100%; max-inline-size: 460px">
  <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-block-end: 8px">
    <xh-text-field id="json-search-field" placeholder="搜索键名或值" size="sm" value="xihan">
      <div data-xh-part="root">
        <div data-xh-part="control">
          <input data-xh-part="input" aria-label="搜索 JSON" />
        </div>
      </div>
    </xh-text-field>
    <xh-button id="json-search-prev" variant="outline" size="sm">
      <button data-xh-part="root">上一条</button>
    </xh-button>
    <xh-button id="json-search-next" variant="outline" size="sm">
      <button data-xh-part="root">下一条</button>
    </xh-button>
    <span id="json-search-count" aria-live="polite"></span>
  </div>
  <xh-json-viewer id="json-search-viewer" search="xihan">
    <div data-xh-part="root"></div>
  </xh-json-viewer>
</div>

<script type="module">
  const viewer = document.getElementById("json-search-viewer");
  const field = document.getElementById("json-search-field");
  const count = document.getElementById("json-search-count");
  viewer.value = {
  name: "曦寒视图",
  version: "1.0.0-alpha.2",
  author: { name: "曦寒", site: "xihanfun.com" },
  packages: [
    { name: "@xihan-ui/vue", size: 128 },
    { name: "@xihan-ui/react", size: 131 },
    { name: "@xihan-ui/web-components", size: 142 },
  ],
};

  // 计数与两颗按钮跟着命中走：命中与停在哪一条都是即时算出的，改完搜索词就能读
  function refresh() {
    const matches = viewer.searchMatches;
    const at = viewer.activeMatch ? matches.indexOf(viewer.activeMatch) + 1 : 0;
    count.textContent = matches.length ? \`\${at} / \${matches.length}\` : "无命中";
    for (const id of ["json-search-prev", "json-search-next"])
      document.getElementById(id).disabled = matches.length === 0;
  }

  field.addEventListener("value-change", (event) => {
    field.value = event.detail.value;
    viewer.search = event.detail.value;
    refresh();
  });
  document.getElementById("json-search-prev").addEventListener("click", () => {
    viewer.prevMatch();
    refresh();
  });
  document.getElementById("json-search-next").addEventListener("click", () => {
    viewer.nextMatch();
    refresh();
  });
  refresh();
<\/script>
`;export{e as default};