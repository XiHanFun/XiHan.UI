const t=`<!-- 整组换一档尺寸 | 高度、内边距与字号各是一个组件令牌，写在 root 上由整组条目继承，不必逐个条目改 -->
<!-- 三个槽位一起换档，取的是控件尺寸家族里的同一档，跟同页别的控件对得上 -->
<xh-toggle-group default-value="day">
  <div
    data-xh-part="root"
    style="
      --xh-toggle-group-item-h: var(--xh-control-h-sm);
      --xh-toggle-group-item-px: var(--xh-control-px-sm);
      --xh-toggle-group-item-font-size: var(--xh-font-size-sm);
    "
  >
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>

<!-- 不写就是缺省档 -->
<xh-toggle-group default-value="week">
  <div data-xh-part="root">
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>

<xh-toggle-group default-value="month">
  <div
    data-xh-part="root"
    style="
      --xh-toggle-group-item-h: var(--xh-control-h-lg);
      --xh-toggle-group-item-px: var(--xh-control-px-lg);
      --xh-toggle-group-item-font-size: var(--xh-font-size-lg);
    "
  >
    <button data-xh-part="item" value="day">日</button>
    <button data-xh-part="item" value="week">周</button>
    <button data-xh-part="item" value="month">月</button>
  </div>
</xh-toggle-group>
`;export{t as default};
