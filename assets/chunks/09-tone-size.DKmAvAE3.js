const a=`<!-- 语气与尺寸 | tone 换勾选方框的色族，size 换方框边长与文字档；两轴打在组容器上，条目自己不写 -->
<div style="display: flex; flex-wrap: wrap; gap: 32px; align-items: flex-start">
  <xh-checkbox-group tone="success" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">success</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group tone="warning" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">warning</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group tone="danger" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">danger</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group size="sm" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">sm</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>

  <xh-checkbox-group size="lg" default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">lg</span>
      <div data-xh-part="item" value="cheese">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">芝士</span>
      </div>
      <div data-xh-part="item" value="bacon">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="indicator"></span>
        <span data-xh-part="item-text">培根</span>
      </div>
    </div>
  </xh-checkbox-group>
</div>
`;export{a as default};
