var e=`<!-- 分体按钮 | 主操作旁接一个下拉菜单 -->
<xh-button-group variant="solid">
  <div data-xh-part="root">
    <xh-button>
      <button data-xh-part="root">保存</button>
    </xh-button>
    <xh-menu placement="bottom-end">
      <xh-button data-xh-part="trigger" icon-only>
        <button data-xh-part="root" aria-label="更多保存方式">
          <xh-icon>
            <svg data-xh-part="root" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9L12 15L18 9" /></svg>
          </xh-icon>
        </button>
      </xh-button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <div data-xh-part="item" value="save-as">另存为</div>
          <div data-xh-part="item" value="save-template">存为模板</div>
          <div data-xh-part="item" value="save-copy">保存副本</div>
        </div>
      </div>
    </xh-menu>
  </div>
</xh-button-group>
`;export{e as default};