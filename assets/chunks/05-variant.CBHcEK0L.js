const a=`<!-- 形态 | variant 只改触发器的颜色槽位，浮层与键盘行为三档一致 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-select variant="outline" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">outline</span>
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="subtle" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">subtle</span>
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>

  <xh-select variant="ghost" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">ghost</span>
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="list">
            <div data-xh-part="item" value="apple">
              <span data-xh-part="item-text">苹果</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="banana">
              <span data-xh-part="item-text">香蕉</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="cherry">
              <span data-xh-part="item-text">樱桃</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-select>
</div>
`;export{a as default};
