const a=`<!-- 语气 | tone 换的是高亮底色，静止态一样：悬停到 trigger 上、或展开菜单后把焦点移到条目上才显现 -->
<!-- 菜单浮层往下落位，给容器底部留出它展开的空间 -->
<div style="inline-size: 100%; display: grid; gap: 8px; padding-block-end: 160px">
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">brand（缺省）</span>
    <xh-menubar tone="brand">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">neutral</span>
    <xh-menubar tone="neutral">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">success</span>
    <xh-menubar tone="success">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">warning</span>
    <xh-menubar tone="warning">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">danger</span>
    <xh-menubar tone="danger">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
  <div style="display: flex; align-items: center; gap: 12px">
    <span style="inline-size: 120px; flex: none">info</span>
    <xh-menubar tone="info">
      <div data-xh-part="root">
        <button data-xh-part="trigger" value="file">文件</button>
        <button data-xh-part="trigger" value="edit">编辑</button>

        <div data-xh-part="positioner" value="file">
          <div data-xh-part="content" value="file">
            <div data-xh-part="item" value="new">
              <span data-xh-part="item-text">新建</span>
            </div>
            <div data-xh-part="item" value="open">
              <span data-xh-part="item-text">打开</span>
            </div>
            <div data-xh-part="item" value="save">
              <span data-xh-part="item-text">保存</span>
            </div>
          </div>
        </div>

        <div data-xh-part="positioner" value="edit">
          <div data-xh-part="content" value="edit">
            <div data-xh-part="item" value="undo">
              <span data-xh-part="item-text">撤销</span>
            </div>
            <div data-xh-part="item" value="redo">
              <span data-xh-part="item-text">重做</span>
            </div>
          </div>
        </div>
      </div>
    </xh-menubar>
  </div>
</div>
`;export{a as default};
