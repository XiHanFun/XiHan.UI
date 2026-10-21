var e=`<!-- 条目说明 | 一句名称说不清的解释写进说明，叶子与分支都可以带，落在名称下面一行；窄的时候截断，不把树撑宽 -->
<div style="width: 100%; max-width: 240px">
  <xh-tree id="tree-item-description">
    <div data-xh-part="root">
      <span data-xh-part="label">字段</span>
      <div data-xh-part="tree">
        <div data-xh-part="branch" value="order">
          <div data-xh-part="branch-control">
            <span data-xh-part="branch-trigger"></span>
            <span data-xh-part="branch-text">订单</span>
            <span data-xh-part="branch-description">一笔订单抬头上的字段</span>
          </div>
          <div data-xh-part="branch-content">
            <div data-xh-part="item" value="no">
              <span data-xh-part="item-text">订单号</span>
              <span data-xh-part="item-description">系统生成的唯一编号，打印在单据抬头与条码里</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="date">
              <span data-xh-part="item-text">下单日期</span>
              <span data-xh-part="item-description">按下单时所在时区记</span>
              <span data-xh-part="item-indicator"></span>
            </div>
            <div data-xh-part="item" value="amount">
              <span data-xh-part="item-text">实付金额</span>
              <span data-xh-part="item-indicator"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </xh-tree>
</div>

<script type="module">
  const tree = document.getElementById("tree-item-description");

  tree.collection = [
    {
      value: "order",
      label: "订单",
      description: "一笔订单抬头上的字段",
      children: [
        { value: "no", label: "订单号", description: "系统生成的唯一编号，打印在单据抬头与条码里" },
        { value: "date", label: "下单日期", description: "按下单时所在时区记" },
        { value: "amount", label: "实付金额" },
      ],
    },
  ];
  tree.defaultExpandedValue = ["order"];
<\/script>
`;export{e as default};