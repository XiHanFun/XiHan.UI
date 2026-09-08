const a=`<!-- 语气与尺寸 | tone 换勾选标记的色族，size 换条目行与勾选格的几何档；两轴打在根上，两侧面板一起走 -->
<div style="display: flex; flex-direction: column; gap: 16px; max-inline-size: 520px">
  <xh-transfer class="transfer-axes" tone="success" default-value="read">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选 · success</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>

  <xh-transfer class="transfer-axes" tone="danger" default-value="read">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选 · danger</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>

  <xh-transfer class="transfer-axes" size="sm" default-value="read">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选 · sm</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>

  <xh-transfer class="transfer-axes" size="lg" default-value="read">
    <div data-xh-part="root">
      <div data-xh-part="source-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">待选 · lg</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>

      <button data-xh-part="to-target-trigger"></button>
      <button data-xh-part="to-source-trigger"></button>

      <div data-xh-part="target-panel">
        <div data-xh-part="panel-header">
          <span data-xh-part="panel-title">已选</span>
        </div>
        <div data-xh-part="list">
          <div data-xh-part="item" value="read">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">查看</span>
          </div>
          <div data-xh-part="item" value="create">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">新建</span>
          </div>
          <div data-xh-part="item" value="update">
            <span data-xh-part="item-checkbox"></span>
            <span data-xh-part="item-text">编辑</span>
          </div>
        </div>
      </div>
    </div>
  </xh-transfer>
</div>

<script type="module">
  // 条目全集是数组，只走 property：四份共用同一份
  const collection = [
    { value: "read", label: "查看" },
    { value: "create", label: "新建" },
    { value: "update", label: "编辑" },
  ];
  for (const transfer of document.querySelectorAll(".transfer-axes")) transfer.collection = collection;
<\/script>
`;export{a as default};
