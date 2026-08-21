const a=`<!-- 语气 | tone 决定选中圆点用哪族颜色，六种语气各一组 -->
<div style="display: flex; gap: 32px; flex-wrap: wrap">
  <xh-radio-group tone="brand" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">brand</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="neutral" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">neutral</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="success" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="warning" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="danger" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
  <xh-radio-group tone="info" default-value="yes">
    <div data-xh-part="root">
      <span data-xh-part="label">info</span>
      <div data-xh-part="item" value="yes">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">选中</span>
      </div>
      <div data-xh-part="item" value="no">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">未选</span>
      </div>
    </div>
  </xh-radio-group>
</div>
`;export{a as default};
