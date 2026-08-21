const a=`<!-- 禁用与只读 | 整组禁用连隐藏输入一起退出提交，只读则仍能聚焦与朗读、只是改不动 -->
<xh-checkbox-group default-value="cheese" disabled>
  <div data-xh-part="root">
    <span data-xh-part="label">整组禁用</span>
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

<xh-checkbox-group default-value="cheese" read-only>
  <div data-xh-part="root">
    <span data-xh-part="label">整组只读</span>
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
    <span data-xh-part="label">单项禁用</span>
    <div data-xh-part="item" value="cheese">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">芝士</span>
    </div>
    <!-- 单项禁用写在条目节点上 -->
    <div data-xh-part="item" value="truffle" aria-disabled="true">
      <input data-xh-part="hidden-input" />
      <span data-xh-part="indicator"></span>
      <span data-xh-part="item-text">松露</span>
    </div>
  </div>
</xh-checkbox-group>
`;export{a as default};
