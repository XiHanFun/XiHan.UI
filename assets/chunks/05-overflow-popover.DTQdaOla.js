var e=`<!-- 「+N」展开其余成员 | 计数那一枚要能点开时换成按钮，作浮层的触发器：浮层里列出没摆出来的人，排成一行的只留前几位 -->
<xh-avatar-group max="4">
  <div data-xh-part="root">
    <xh-avatar>
      <span data-xh-part="root">
        <span data-xh-part="fallback">曦</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <span data-xh-part="fallback">寒</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <span data-xh-part="fallback">懿</span>
      </span>
    </xh-avatar>
    <xh-avatar>
      <span data-xh-part="root">
        <span data-xh-part="fallback">承</span>
      </span>
    </xh-avatar>

    <!-- 计数那一枚换成浮层的触发器：宿主摆成圆形的一枚，叠放与描圈照常落在它身上 -->
    <xh-popover placement="bottom-start" style="display: inline-flex; border-radius: var(--xh-shape-circle)">
      <button data-xh-part="trigger" aria-label="还有 4 位成员" style="inline-size: var(--xh-avatar-size); block-size: var(--xh-avatar-size); padding: 0; border: 0; border-radius: var(--xh-shape-circle); background: var(--xh-bg-subtle); color: var(--xh-fg-default); font: inherit; font-size: var(--xh-avatar-font-size); cursor: pointer">+4</button>
      <div data-xh-part="positioner">
        <div data-xh-part="content">
          <h3 data-xh-part="title">还有 4 位成员</h3>
          <xh-list size="sm" style="display: contents">
            <ul data-xh-part="root">
              <li data-xh-part="item">
                <div data-xh-part="item-media">
                  <xh-avatar size="sm">
                    <span data-xh-part="root">
                      <span data-xh-part="fallback">临</span>
                    </span>
                  </xh-avatar>
                </div>
                <div data-xh-part="item-content">
                  <div data-xh-part="item-title">临川</div>
                  <div data-xh-part="item-description">测试</div>
                </div>
              </li>
              <li data-xh-part="item">
                <div data-xh-part="item-media">
                  <xh-avatar size="sm">
                    <span data-xh-part="root">
                      <span data-xh-part="fallback">旭</span>
                    </span>
                  </xh-avatar>
                </div>
                <div data-xh-part="item-content">
                  <div data-xh-part="item-title">旭东</div>
                  <div data-xh-part="item-description">运维</div>
                </div>
              </li>
              <li data-xh-part="item">
                <div data-xh-part="item-media">
                  <xh-avatar size="sm">
                    <span data-xh-part="root">
                      <span data-xh-part="fallback">言</span>
                    </span>
                  </xh-avatar>
                </div>
                <div data-xh-part="item-content">
                  <div data-xh-part="item-title">言蹊</div>
                  <div data-xh-part="item-description">产品</div>
                </div>
              </li>
              <li data-xh-part="item">
                <div data-xh-part="item-media">
                  <xh-avatar size="sm">
                    <span data-xh-part="root">
                      <span data-xh-part="fallback">知</span>
                    </span>
                  </xh-avatar>
                </div>
                <div data-xh-part="item-content">
                  <div data-xh-part="item-title">知远</div>
                  <div data-xh-part="item-description">数据</div>
                </div>
              </li>
            </ul>
          </xh-list>
        </div>
      </div>
    </xh-popover>
  </div>
</xh-avatar-group>
`;export{e as default};