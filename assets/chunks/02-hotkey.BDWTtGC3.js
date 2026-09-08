const a=`<!-- 快捷键唤起 + 手写部件 | Mod+K 打开，命中的字由文本高亮标出来，行尾挂各命令自己的快捷键 -->
<!-- 唤起的入口：监听装在整篇文档上，面板收着也按得出来 -->
<div style="display: flex; align-items: center; gap: 8px">
  <xh-hotkeys id="command-hotkey-trigger" keys="Mod,K">
    <span data-xh-part="root"></span>
  </xh-hotkeys>
  <span>按一下唤起命令面板</span>
</div>

<xh-command id="command-hotkey" placeholder="搜命令…">
  <div data-xh-part="backdrop"></div>
  <div data-xh-part="positioner">
    <div data-xh-part="content">
      <input data-xh-part="input" />
      <div data-xh-part="list">
        <div data-xh-part="group" value="file">
          <span data-xh-part="group-label">文件</span>
          <div data-xh-part="item" value="new">
            <span data-xh-part="item-text">
              <xh-highlight text="新建文档"><span data-xh-part="root"></span></xh-highlight>
            </span>
            <xh-hotkeys keys="Mod,N" enabled="false" size="sm">
              <span data-xh-part="root"></span>
            </xh-hotkeys>
          </div>
          <div data-xh-part="item" value="save">
            <span data-xh-part="item-text">
              <xh-highlight text="保存"><span data-xh-part="root"></span></xh-highlight>
            </span>
            <xh-hotkeys keys="Mod,S" enabled="false" size="sm">
              <span data-xh-part="root"></span>
            </xh-hotkeys>
          </div>
          <div data-xh-part="item" value="search">
            <span data-xh-part="item-text">
              <xh-highlight text="全局搜索"><span data-xh-part="root"></span></xh-highlight>
            </span>
          </div>
        </div>
        <div data-xh-part="group" value="view">
          <span data-xh-part="group-label">视图</span>
          <div data-xh-part="item" value="theme">
            <span data-xh-part="item-text">
              <xh-highlight text="切换主题"><span data-xh-part="root"></span></xh-highlight>
            </span>
          </div>
          <div data-xh-part="item" value="zen">
            <span data-xh-part="item-text">
              <xh-highlight text="专注模式"><span data-xh-part="root"></span></xh-highlight>
            </span>
          </div>
        </div>
      </div>
      <div data-xh-part="empty">没有匹配的命令</div>
      <footer data-xh-part="footer">↑↓ 选择 · ↵ 执行 · Esc 关闭</footer>
    </div>
  </div>
</xh-command>

<script type="module">
  const host = document.getElementById("command-hotkey");
  host.collection = [
    { value: "new", label: "新建文档", group: "file" },
    { value: "save", label: "保存", group: "file" },
    { value: "search", label: "全局搜索", group: "file", keywords: ["search"] },
    { value: "theme", label: "切换主题", group: "view" },
    { value: "zen", label: "专注模式", group: "view" },
  ];
  host.groups = [
    { value: "file", label: "文件" },
    { value: "view", label: "视图" },
  ];

  // 组合命中即打开：面板收着的时候监听照样在整篇文档上
  document
    .getElementById("command-hotkey-trigger")
    .addEventListener("hot-key", () => host.setOpen(true));

  // 检索串就是高亮的关键词，用户看得见这条为什么被选出来
  const marks = host.querySelectorAll("xh-highlight");
  host.addEventListener("input-value-change", (event) => {
    for (const mark of marks) mark.keyword = event.detail.inputValue;
  });
<\/script>
`;export{a as default};
