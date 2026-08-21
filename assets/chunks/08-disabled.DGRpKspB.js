const a=`<!-- 禁用 | 禁用走 aria-disabled 而非原生 disabled：禁用的入口仍聚焦得上、仍是方向键的起点，只是展不开菜单 -->
<div style="inline-size: 100%; display: grid; gap: 12px; padding-block-end: 140px">
  <xh-menubar id="menubar-disabled">
    <div data-xh-part="root">
      <button data-xh-part="trigger" value="file">文件</button>
      <!-- 单项禁用：整条没锁时，也只有这一项展不开 -->
      <button data-xh-part="trigger" value="edit" aria-disabled="true">编辑</button>
      <button data-xh-part="trigger" value="help">帮助</button>

      <div data-xh-part="positioner" value="file">
        <div data-xh-part="content" value="file">
          <div data-xh-part="item" value="new">
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="open">
            <span data-xh-part="item-text">打开</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="edit">
        <div data-xh-part="content" value="edit">
          <div data-xh-part="item" value="undo">
            <span data-xh-part="item-text">撤销</span>
          </div>
        </div>
      </div>

      <div data-xh-part="positioner" value="help">
        <div data-xh-part="content" value="help">
          <div data-xh-part="item" value="about">
            <span data-xh-part="item-text">关于</span>
          </div>
        </div>
      </div>
    </div>
  </xh-menubar>

  <div style="display: flex; align-items: center; gap: 8px">
    <xh-switch id="menubar-disabled-switch">
      <button data-xh-part="root">
        <span data-xh-part="thumb"></span>
      </button>
    </xh-switch>
    <span>整条禁用（展开与选中都不再发生）</span>
  </div>
</div>

<script type="module">
  // 开关翻到开就锁住整条菜单栏
  const menubar = document.getElementById("menubar-disabled");
  document
    .getElementById("menubar-disabled-switch")
    .addEventListener("checked-change", (event) => {
      menubar.disabled = event.detail.checked;
    });
<\/script>
`;export{a as default};
