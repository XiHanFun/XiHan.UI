const a=`<!-- 形态与尺寸 | variant 换这块闸门怎么与正文分开，size 换标题、条目与按钮的几何档；判定链一个字不动 -->
<div style="display: flex; flex-direction: column; gap: 12px">
  <xh-approval class="approval-axes" variant="outline">
    <div data-xh-part="root">
      <h3 data-xh-part="title">描边（缺省）</h3>
      <div data-xh-part="group">
        <div data-xh-part="item" scope-value="write" scope-label="写回改动">
          <span data-xh-part="item-indicator" scope-value="write"></span>
          <span data-xh-part="item-text" scope-value="write">写回改动</span>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>

  <xh-approval class="approval-axes" variant="subtle">
    <div data-xh-part="root">
      <h3 data-xh-part="title">弱底分区</h3>
      <div data-xh-part="group">
        <div data-xh-part="item" scope-value="write" scope-label="写回改动">
          <span data-xh-part="item-indicator" scope-value="write"></span>
          <span data-xh-part="item-text" scope-value="write">写回改动</span>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>

  <xh-approval class="approval-axes" variant="ghost">
    <div data-xh-part="root">
      <h3 data-xh-part="title">无壳内联</h3>
      <div data-xh-part="group">
        <div data-xh-part="item" scope-value="write" scope-label="写回改动">
          <span data-xh-part="item-indicator" scope-value="write"></span>
          <span data-xh-part="item-text" scope-value="write">写回改动</span>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>

  <xh-approval class="approval-axes" variant="outline" size="sm">
    <div data-xh-part="root">
      <h3 data-xh-part="title">小档</h3>
      <div data-xh-part="group">
        <div data-xh-part="item" scope-value="write" scope-label="写回改动">
          <span data-xh-part="item-indicator" scope-value="write"></span>
          <span data-xh-part="item-text" scope-value="write">写回改动</span>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>

  <xh-approval class="approval-axes" variant="outline" size="lg">
    <div data-xh-part="root">
      <h3 data-xh-part="title">大档</h3>
      <div data-xh-part="group">
        <div data-xh-part="item" scope-value="write" scope-label="写回改动">
          <span data-xh-part="item-indicator" scope-value="write"></span>
          <span data-xh-part="item-text" scope-value="write">写回改动</span>
        </div>
      </div>
      <div data-xh-part="footer">
        <button data-xh-part="approve-trigger">批准</button>
        <button data-xh-part="deny-trigger">拒绝</button>
      </div>
    </div>
  </xh-approval>
</div>

<script type="module">
  // 授权项是数组，只走 property：五档共用同一份
  for (const gate of document.querySelectorAll(".approval-axes"))
    gate.scopes = [{ value: "write", label: "写回改动" }];
<\/script>
`;export{a as default};
