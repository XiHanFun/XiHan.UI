const a=`<!-- 状态 | 禁用整组置灰、只读只挡落值不挡焦点、无效把描边转成警示色 -->
<div style="display: flex; flex-wrap: wrap; gap: 24px">
  <xh-color-swatch-picker default-value="#10b981" disabled>
    <div data-xh-part="root">
      <span data-xh-part="label">禁用</span>
      <div data-xh-part="item" value="#e11d48" label="玫红">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#f59e0b" label="琥珀">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#10b981" label="翠绿">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#3b82f6" label="天蓝">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
    </div>
  </xh-color-swatch-picker>

  <xh-color-swatch-picker default-value="#10b981" read-only>
    <div data-xh-part="root">
      <span data-xh-part="label">只读</span>
      <div data-xh-part="item" value="#e11d48" label="玫红">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#f59e0b" label="琥珀">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#10b981" label="翠绿">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#3b82f6" label="天蓝">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
    </div>
  </xh-color-swatch-picker>

  <xh-color-swatch-picker invalid required>
    <div data-xh-part="root">
      <span data-xh-part="label">必填未选</span>
      <div data-xh-part="item" value="#e11d48" label="玫红">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#f59e0b" label="琥珀">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#10b981" label="翠绿">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
      <div data-xh-part="item" value="#3b82f6" label="天蓝">
        <input data-xh-part="hidden-input" />
        <span data-xh-part="swatch"></span>
        <span data-xh-part="indicator"></span>
      </div>
    </div>
  </xh-color-swatch-picker>
</div>
`;export{a as default};
