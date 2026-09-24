const a=`<!-- 选项副文本 | 一行放不下的解释写在第 2 行 -->
<xh-select default-value="team" placeholder="请选择">
  <div data-xh-part="root">
    <span data-xh-part="label">订阅方案</span>
    <div data-xh-part="control">
      <button data-xh-part="trigger">
        <span data-xh-part="value-text"></span>
        <span data-xh-part="indicator"></span>
      </button>
    </div>
    <div data-xh-part="positioner">
      <div data-xh-part="content">
        <div data-xh-part="list">
          <div data-xh-part="item" value="free">
            <span data-xh-part="item-text">免费版</span>
            <span data-xh-part="item-description">单人使用，保留 30 天历史</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="team">
            <span data-xh-part="item-text">团队版</span>
            <span data-xh-part="item-description">最多 20 人，共享工作区与审计日志</span>
            <span data-xh-part="item-indicator"></span>
          </div>
          <div data-xh-part="item" value="enterprise">
            <span data-xh-part="item-text">企业版</span>
            <span data-xh-part="item-description">单点登录、私有部署与专属支持</span>
            <span data-xh-part="item-indicator"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</xh-select>
`;export{a as default};
