const a=`<!-- 语气 | tone 决定用哪族颜色，与 variant 正交；这里固定 outline 只看语气的差别 -->
<div style="display: flex; flex-wrap: wrap; gap: 16px">
  <xh-select variant="outline" tone="brand" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">brand</span>
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

  <xh-select variant="outline" tone="neutral" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">neutral</span>
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

  <xh-select variant="outline" tone="success" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
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

  <xh-select variant="outline" tone="warning" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
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

  <xh-select variant="outline" tone="danger" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
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

  <xh-select variant="outline" tone="info" default-value="apple" placeholder="请选择">
    <div data-xh-part="root">
      <span data-xh-part="label">info</span>
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
