const a=`<!-- 形态·语气·尺寸 | 三个视觉轴只写在根上，盒与浮层都从这里继承 -->
<div style="display: flex; flex-wrap: wrap; gap: 12px; align-items: center">
  <xh-popselect variant="outline" size="sm" default-value="free">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <button data-xh-part="trigger">outline · sm</button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="free">
            <span data-xh-part="item-text">免费版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="pro">
            <span data-xh-part="item-text">专业版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="team">
            <span data-xh-part="item-text">团队版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </xh-popselect>

  <xh-popselect variant="subtle" tone="success" size="md" default-value="pro">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <button data-xh-part="trigger">subtle · success</button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="free">
            <span data-xh-part="item-text">免费版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="pro">
            <span data-xh-part="item-text">专业版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="team">
            <span data-xh-part="item-text">团队版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </xh-popselect>

  <xh-popselect variant="ghost" tone="danger" size="lg" default-value="team">
    <div data-xh-part="root">
      <div data-xh-part="control">
        <button data-xh-part="trigger">ghost · danger · lg</button>
      </div>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="free">
            <span data-xh-part="item-text">免费版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="pro">
            <span data-xh-part="item-text">专业版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="team">
            <span data-xh-part="item-text">团队版</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </xh-popselect>
</div>
`;export{a as default};
