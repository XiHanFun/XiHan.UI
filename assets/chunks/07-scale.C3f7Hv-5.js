const a=`<!-- 整组换档 | 方框边长、字号、间距与选中色都是组件令牌，写在组容器上整组一起生效 -->
<div style="display: flex; gap: 32px; flex-wrap: wrap; align-items: flex-start">
  <xh-checkbox-group default-value="cheese">
    <!-- 一档尺寸就是一组令牌：方框边长、勾的字号、条目字号、条目内间距与条目间距 -->
    <div
      data-xh-part="root"
      style="
        --xh-checkbox-group-control-size: 13px;
        --xh-checkbox-group-control-font-size: 10px;
        --xh-checkbox-group-item-font-size: 13px;
        --xh-checkbox-group-item-gap: 6px;
        --xh-checkbox-group-gap: 8px;
      "
    >
      <span data-xh-part="label">紧凑</span>
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

  <xh-checkbox-group default-value="cheese">
    <div data-xh-part="root">
      <span data-xh-part="label">缺省</span>
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

  <xh-checkbox-group default-value="cheese">
    <div
      data-xh-part="root"
      style="
        --xh-checkbox-group-control-size: 20px;
        --xh-checkbox-group-control-font-size: 15px;
        --xh-checkbox-group-item-font-size: 17px;
        --xh-checkbox-group-item-gap: 10px;
        --xh-checkbox-group-gap: 14px;
      "
    >
      <span data-xh-part="label">宽松</span>
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

  <xh-checkbox-group default-value="cheese">
    <!-- 选中态的底与描边各是一个令牌，两个一起换才不会只填色不换边 -->
    <div
      data-xh-part="root"
      style="
        --xh-checkbox-group-control-bg-checked: #16a34a;
        --xh-checkbox-group-control-border-checked: #16a34a;
      "
    >
      <span data-xh-part="label">换选中色</span>
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
