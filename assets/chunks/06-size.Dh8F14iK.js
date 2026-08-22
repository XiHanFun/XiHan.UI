const a=`<!-- 尺寸 | size 换序号圆点的直径与标题、说明的字号，不传 size 即默认档 -->
<div style="display: flex; flex-direction: column; gap: 24px; inline-size: 100%">
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">小</div>
    <xh-steps size="sm" count="3" default-step="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <!-- 中间一档不写 size -->
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">默认</div>
    <xh-steps count="3" default-step="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
  <div>
    <div style="margin-block-end: 8px; font-size: 12px">大</div>
    <xh-steps size="lg" count="3" default-step="1">
      <div data-xh-part="root" style="inline-size: 100%">
        <div data-xh-part="list">
          <div data-xh-part="item" value="0">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator"></span>
              <span data-xh-part="title">填写地址</span>
              <span data-xh-part="description">收货人与联系方式</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="1">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">2</span>
              <span data-xh-part="title">选择支付</span>
              <span data-xh-part="description">支付方式与优惠</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
          <div data-xh-part="item" value="2">
            <button data-xh-part="trigger">
              <span data-xh-part="indicator">3</span>
              <span data-xh-part="title">确认订单</span>
              <span data-xh-part="description">核对金额</span>
            </button>
            <div data-xh-part="separator"></div>
          </div>
        </div>

        <div data-xh-part="content" value="0">面板 1：填写地址</div>
        <div data-xh-part="content" value="1">面板 2：选择支付</div>
        <div data-xh-part="content" value="2">面板 3：确认订单</div>
        <div data-xh-part="content" value="3">全部完成。</div>
      </div>
    </xh-steps>
  </div>
</div>
`;export{a as default};
