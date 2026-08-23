const a=`<!-- 宽度 | 盒与浮层各有自己的宽度槽位，写在根部件上即可；装不下的文本在行内以省略号收口 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-select default-value="long" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">缺省宽度</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="basic">
              <span data-xh-part="item-text">基础版</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="pro">
              <span data-xh-part="item-text">专业版</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="long">
              <span data-xh-part="item-text">
                旗舰版 · 含无限席位与专属客户成功经理的年度合约
              </span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select default-value="long" placeholder="请选择">
    <div
      data-xh-part="root"
      style="--xh-select-control-min-w: 15rem; --xh-select-content-min-w: 22rem"
    >
      <span data-xh-part="label">加宽</span>
      <div data-xh-part="control">
        <button data-xh-part="trigger">
          <span data-xh-part="value-text"></span>
          <span data-xh-part="indicator"></span>
        </button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="basic">
              <span data-xh-part="item-text">基础版</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="pro">
              <span data-xh-part="item-text">专业版</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="long">
              <span data-xh-part="item-text">
                旗舰版 · 含无限席位与专属客户成功经理的年度合约
              </span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>
</div>
`;export{a as default};
