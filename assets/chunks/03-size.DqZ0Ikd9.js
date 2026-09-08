const a=`<!-- 尺寸 | size 打在组上沿继承流下发给每一枚标签，标签自己不写档位 -->
<div style="display: flex; flex-direction: column; gap: 12px; align-items: flex-start">
  <xh-tag-group size="sm">
    <div data-xh-part="root">
      <span data-xh-part="label">小档</span>
      <div data-xh-part="list">
        <span data-xh-part="item" value="vue">
          <span data-xh-part="cell"><span data-xh-part="item-text">Vue</span></span>
        </span>
        <span data-xh-part="item" value="react">
          <span data-xh-part="cell"><span data-xh-part="item-text">React</span></span>
        </span>
        <span data-xh-part="item" value="svelte">
          <span data-xh-part="cell"><span data-xh-part="item-text">Svelte</span></span>
        </span>
      </div>
    </div>
  </xh-tag-group>

  <xh-tag-group>
    <div data-xh-part="root">
      <span data-xh-part="label">缺省档</span>
      <div data-xh-part="list">
        <span data-xh-part="item" value="vue">
          <span data-xh-part="cell"><span data-xh-part="item-text">Vue</span></span>
        </span>
        <span data-xh-part="item" value="react">
          <span data-xh-part="cell"><span data-xh-part="item-text">React</span></span>
        </span>
        <span data-xh-part="item" value="svelte">
          <span data-xh-part="cell"><span data-xh-part="item-text">Svelte</span></span>
        </span>
      </div>
    </div>
  </xh-tag-group>

  <xh-tag-group size="lg">
    <div data-xh-part="root">
      <span data-xh-part="label">大档</span>
      <div data-xh-part="list">
        <span data-xh-part="item" value="vue">
          <span data-xh-part="cell"><span data-xh-part="item-text">Vue</span></span>
        </span>
        <span data-xh-part="item" value="react">
          <span data-xh-part="cell"><span data-xh-part="item-text">React</span></span>
        </span>
        <span data-xh-part="item" value="svelte">
          <span data-xh-part="cell"><span data-xh-part="item-text">Svelte</span></span>
        </span>
      </div>
    </div>
  </xh-tag-group>
</div>
`;export{a as default};
