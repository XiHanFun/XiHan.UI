const t=`<!-- 放进浮动按钮 | 作为浮动按钮展开列表里的一项，根按列表排布 -->
<xh-float-button default-open>
  <div data-xh-part="root" style="position: static">
    <button data-xh-part="trigger"></button>
    <div data-xh-part="list">
      <xh-back-top style="display: contents">
        <div data-xh-part="root" style="position: static">
          <button data-xh-part="trigger"></button>
        </div>
      </xh-back-top>
      <button type="button" aria-label="消息"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.91 19.2A8.5 8.5 0 1 0 4.51 14.41L3 20.5Z"/></svg></button>
    </div>
  </div>
</xh-float-button>
`;export{t as default};
