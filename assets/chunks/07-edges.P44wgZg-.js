var e=`<!-- 首页与末页 | 页数很多时一步跳到头 -->
<xh-pagination
  id="pagination-edges"
  count="1000"
  page-size="10"
  page="37"
>
  <nav data-xh-part="root">
    <button data-xh-part="first-trigger"></button>
    <button data-xh-part="prev-trigger"></button>
    <button id="pagination-edges-current" data-xh-part="item" value="37">
      37
    </button>
    <span id="pagination-edges-total">/ 100</span>
    <button data-xh-part="next-trigger"></button>
    <button data-xh-part="last-trigger"></button>
  </nav>
</xh-pagination>

<script type="module">
  const host = document.getElementById("pagination-edges");
  const current = document.getElementById("pagination-edges-current");
  const total = document.getElementById("pagination-edges-total");

  host.addEventListener("page-change", (event) => {
    host.page = event.detail.page;
    current.setAttribute("value", String(host.currentPage));
    current.textContent = String(host.currentPage);
    total.textContent = \`/ \${host.totalPages}\`;
  });
<\/script>
`;export{e as default};