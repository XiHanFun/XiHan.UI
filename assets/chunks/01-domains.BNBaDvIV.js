const t=`<!-- 声明极性 | 彩色区块写上 data-xh-ink，域内的描边、淡底、正文与主要动作都改取墨色 -->
<div style="width: 100%; display: grid; gap: 12px">
  <section data-xh-ink="dark" style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-color-yellow-300)">
    <xh-button><button data-xh-part="root">发布</button></xh-button>
    <xh-button variant="outline"><button data-xh-part="root">取消</button></xh-button>
    <xh-switch default-checked>
      <button data-xh-part="root" aria-label="通知"><span data-xh-part="thumb"></span></button>
    </xh-switch>
    <xh-text-field placeholder="搜索成员">
      <div data-xh-part="root">
        <div data-xh-part="control"><input data-xh-part="input" aria-label="搜索成员" /></div>
      </div>
    </xh-text-field>
  </section>
  <section data-xh-ink="light" style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 16px; border-radius: var(--xh-shape-surface); background: var(--xh-color-indigo-800)">
    <xh-button><button data-xh-part="root">发布</button></xh-button>
    <xh-button variant="outline"><button data-xh-part="root">取消</button></xh-button>
    <xh-switch default-checked>
      <button data-xh-part="root" aria-label="通知"><span data-xh-part="thumb"></span></button>
    </xh-switch>
    <xh-text-field placeholder="搜索成员">
      <div data-xh-part="root">
        <div data-xh-part="control"><input data-xh-part="input" aria-label="搜索成员" /></div>
      </div>
    </xh-text-field>
  </section>
</div>
`;export{t as default};
