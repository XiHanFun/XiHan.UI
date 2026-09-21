const a=`<!-- 多行表头与表头分组 | 表头写几行就是几行；分组格的跨列数与两行表头的行号由标记声明，columns 仍只登记叶子列 -->
<div style="width: 100%; max-width: 620px">
  <xh-table id="table-group-header">
    <div data-xh-part="root">
      <div data-xh-part="caption">季度交付单量</div>
      <div data-xh-part="header">
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="team"></div>
          <!-- 分组格不是数据列，不进 columns：跨列数、列号与宽度都写在标记上，
               宽度取两列之和、伸缩系数也翻倍，两行表头才对得齐 -->
          <div
            data-xh-part="column-header"
            value="h1"
            aria-colindex="2"
            aria-colspan="2"
            style="inline-size: 10rem; flex-grow: 2"
          >
            <span data-xh-part="column-label">上半年</span>
          </div>
          <div
            data-xh-part="column-header"
            value="h2"
            aria-colindex="4"
            aria-colspan="2"
            style="inline-size: 10rem; flex-grow: 2"
          >
            <span data-xh-part="column-label">下半年</span>
          </div>
        </div>
        <div data-xh-part="row">
          <div data-xh-part="column-header" value="team"><span data-xh-part="column-label">小组</span></div>
          <div data-xh-part="column-header" value="q1"><span data-xh-part="column-label">Q1</span></div>
          <div data-xh-part="column-header" value="q2"><span data-xh-part="column-label">Q2</span></div>
          <div data-xh-part="column-header" value="q3"><span data-xh-part="column-label">Q3</span></div>
          <div data-xh-part="column-header" value="q4"><span data-xh-part="column-label">Q4</span></div>
        </div>
      </div>
      <div data-xh-part="body">
        <div data-xh-part="row" value="t1">
          <div data-xh-part="cell" value="team">平台研发</div>
          <div data-xh-part="cell" value="q1">12</div>
          <div data-xh-part="cell" value="q2">15</div>
          <div data-xh-part="cell" value="q3">18</div>
          <div data-xh-part="cell" value="q4">21</div>
        </div>
        <div data-xh-part="row" value="t2">
          <div data-xh-part="cell" value="team">前端体验</div>
          <div data-xh-part="cell" value="q1">9</div>
          <div data-xh-part="cell" value="q2">11</div>
          <div data-xh-part="cell" value="q3">14</div>
          <div data-xh-part="cell" value="q4">16</div>
        </div>
        <div data-xh-part="row" value="t3">
          <div data-xh-part="cell" value="team">基础架构</div>
          <div data-xh-part="cell" value="q1">7</div>
          <div data-xh-part="cell" value="q2">8</div>
          <div data-xh-part="cell" value="q3">10</div>
          <div data-xh-part="cell" value="q4">12</div>
        </div>
      </div>
    </div>
  </xh-table>
</div>

<script type="module">
  // 只有叶子列进 columns：列号与列总数按它算
  const table = document.getElementById("table-group-header");

  table.columns = [
    { id: "team", label: "小组", width: "8rem" },
    { id: "q1", label: "Q1", width: "5rem" },
    { id: "q2", label: "Q2", width: "5rem" },
    { id: "q3", label: "Q3", width: "5rem" },
    { id: "q4", label: "Q4", width: "5rem" },
  ];
  table.rows = [{ id: "t1" }, { id: "t2" }, { id: "t3" }];
<\/script>
`;export{a as default};
