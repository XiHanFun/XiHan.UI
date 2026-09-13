const a=`<!-- 分组 | 按类别组织选项 -->
<xh-listbox default-value="beijing">
  <div data-xh-part="root" style="inline-size: min(100%, 300px)">
    <span data-xh-part="label">城市</span>
    <div data-xh-part="content">
      <div data-xh-part="group" value="asia">
        <span data-xh-part="group-label">亚洲</span>
        <div data-xh-part="item" value="bangkok">
          <span data-xh-part="item-text">Bangkok 曼谷</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="beijing">
          <span data-xh-part="item-text">Beijing 北京</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="chengdu">
          <span data-xh-part="item-text">Chengdu 成都</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
      <div data-xh-part="group" value="europe">
        <span data-xh-part="group-label">欧洲</span>
        <div data-xh-part="item" value="berlin">
          <span data-xh-part="item-text">Berlin 柏林</span>
          <span data-xh-part="item-indicator"></span>
        </div>
        <div data-xh-part="item" value="london">
          <span data-xh-part="item-text">London 伦敦</span>
          <span data-xh-part="item-indicator"></span>
        </div>
      </div>
    </div>
  </div>
</xh-listbox>
`;export{a as default};
