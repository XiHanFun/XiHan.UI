const t=`<!-- 放置位 | placement 是首选位，位置不够时引擎自己避让，实际落点写在 data-placement 上 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-popconfirm placement="top">
    <div data-xh-part="root">
      <button data-xh-part="trigger">top</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <p data-xh-part="description">要把这条移出列表吗？</p>
          <button data-xh-part="cancel-trigger">再想想</button>
          <button data-xh-part="confirm-trigger">移出</button>
        </div>
      </div>
    </div>
  </xh-popconfirm>

  <xh-popconfirm placement="bottom">
    <div data-xh-part="root">
      <button data-xh-part="trigger">bottom</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <p data-xh-part="description">要把这条移出列表吗？</p>
          <button data-xh-part="cancel-trigger">再想想</button>
          <button data-xh-part="confirm-trigger">移出</button>
        </div>
      </div>
    </div>
  </xh-popconfirm>

  <xh-popconfirm placement="left">
    <div data-xh-part="root">
      <button data-xh-part="trigger">left</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <p data-xh-part="description">要把这条移出列表吗？</p>
          <button data-xh-part="cancel-trigger">再想想</button>
          <button data-xh-part="confirm-trigger">移出</button>
        </div>
      </div>
    </div>
  </xh-popconfirm>

  <xh-popconfirm placement="right">
    <div data-xh-part="root">
      <button data-xh-part="trigger">right</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <p data-xh-part="description">要把这条移出列表吗？</p>
          <button data-xh-part="cancel-trigger">再想想</button>
          <button data-xh-part="confirm-trigger">移出</button>
        </div>
      </div>
    </div>
  </xh-popconfirm>
</div>
`;export{t as default};
