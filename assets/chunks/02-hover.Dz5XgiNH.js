const t=`<!-- 悬停展开 | 指针进入时展开，键盘与触控仍可点击 -->
<xh-float-button expand-trigger="hover">
  <div data-xh-part="root" style="position: static">
    <button data-xh-part="trigger"></button>
    <div data-xh-part="list">
      <button type="button" aria-label="消息"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.91 19.2A8.5 8.5 0 1 0 4.51 14.41L3 20.5Z"/></svg></button>
      <button type="button" aria-label="分享"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="17.5" cy="5.5" r="2.75"/><circle cx="6.5" cy="12" r="2.75"/><circle cx="17.5" cy="18.5" r="2.75"/><line x1="8.87" y1="10.6" x2="15.13" y2="6.9"/><line x1="8.87" y1="13.4" x2="15.13" y2="17.1"/></svg></button>
    </div>
  </div>
</xh-float-button>
`;export{t as default};
