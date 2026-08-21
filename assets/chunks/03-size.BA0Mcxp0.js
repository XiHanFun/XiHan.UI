const t=`<!-- 尺寸 | size 换的是面板的内边距与最大宽度，三个档位落在 content 上 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-popconfirm size="sm">
    <div data-xh-part="root">
      <button data-xh-part="trigger">sm</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">停用这个账号</h2>
          <p data-xh-part="description">
            停用后该账号无法登录，已建立的会话会在下次刷新时失效。
          </p>
          <button data-xh-part="cancel-trigger">取消</button>
          <button data-xh-part="confirm-trigger">停用</button>
        </div>
      </div>
    </div>
  </xh-popconfirm>

  <xh-popconfirm size="md">
    <div data-xh-part="root">
      <button data-xh-part="trigger">md</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">停用这个账号</h2>
          <p data-xh-part="description">
            停用后该账号无法登录，已建立的会话会在下次刷新时失效。
          </p>
          <button data-xh-part="cancel-trigger">取消</button>
          <button data-xh-part="confirm-trigger">停用</button>
        </div>
      </div>
    </div>
  </xh-popconfirm>

  <xh-popconfirm size="lg">
    <div data-xh-part="root">
      <button data-xh-part="trigger">lg</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h2 data-xh-part="title">停用这个账号</h2>
          <p data-xh-part="description">
            停用后该账号无法登录，已建立的会话会在下次刷新时失效。
          </p>
          <button data-xh-part="cancel-trigger">取消</button>
          <button data-xh-part="confirm-trigger">停用</button>
        </div>
      </div>
    </div>
  </xh-popconfirm>
</div>
`;export{t as default};
