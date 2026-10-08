var e=`<!-- 虚拟滚动 | 行数很大时把日志与 Virtualizer 接线：virtualizer 交出 collectionVirtualizer，行放进 Virtualizer 的条目里，只挂窗口里的那些；粘底跟着 Virtualizer 的视口走 -->
<xh-log id="log-virtualized" rows="10" style="inline-size: 100%">
  <div data-xh-part="root">
    <div data-xh-part="viewport">
      <xh-virtualizer id="log-virtualizer" count="10000" estimate-size="20">
        <div data-xh-part="root">
          <div data-xh-part="viewport">
            <div data-xh-part="content"></div>
          </div>
        </div>
      </xh-virtualizer>
    </div>
  </div>
</xh-log>

<script type="module">
  const log = document.getElementById("log-virtualized");
  const virtualizer = document.getElementById("log-virtualizer");
  const content = virtualizer.querySelector('[data-xh-part="content"]');
  const lines = Array.from({ length: 10000 }, (_, index) =>
    \`\${String(index + 1).padStart(5, "0")}  GET /api/orders/\${8000 + index}  200  \${(index % 90) + 10}ms\`);

  // 条目外壳归 Virtualizer，里面的行声明归日志管（data-xh-part-owner="log"），由外层 xh-log 认领
  function render(virtualItems) {
    content.replaceChildren(...virtualItems.map((item) => {
      const shell = document.createElement("div");
      shell.dataset.xhPart = "item";
      shell.setAttribute("value", item.index);
      const line = document.createElement("div");
      line.dataset.xhPart = "line";
      line.dataset.xhPartOwner = "log";
      line.textContent = lines[item.index];
      shell.append(line);
      return shell;
    }));
    virtualizer.requestUpdate();
    log.virtualizer = virtualizer.collectionVirtualizer;
  }

  render(virtualizer.virtualItems);
  virtualizer.addEventListener("range-change", event => render(event.detail.virtualItems));
<\/script>
`;export{e as default};