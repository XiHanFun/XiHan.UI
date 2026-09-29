async function u(){const o=document.getElementById("diff-view-comments");o.model={hunks:[{header:"@@ -1,3 +1,4 @@",oldStart:1,oldLines:3,newStart:1,newLines:4,lines:[{change:"removed",oldNumber:1,text:"export function createClient(base: string) {"},{change:"removed",oldNumber:2,text:"  return fetchJson(base, { timeout: 5000 })"},{change:"added",newNumber:1,text:"export function createClient(base: string, token?: string) {",segments:[{text:"export function createClient(base: string",changed:!1},{text:", token?: string",changed:!0},{text:") {",changed:!1}]},{change:"added",newNumber:2,text:"  const headers = token ? { authorization: token } : {}"},{change:"added",newNumber:3,text:"  return fetchJson(base, { timeout: 30000, headers })"},{change:"context",oldNumber:3,newNumber:4,text:"}"}]}]};const i=t=>`${t.side}:${t.line}`,d=new Map([["new:3","超时从 5 秒放到 30 秒，网关那边的超时也要一起改。"]]);let n=null;function l(){const t=[...d.keys()].map(e=>{const[a,c]=e.split(":");return{side:a,line:Number(c)}});n&&!d.has(i(n))&&t.push(n),o.commentLines=t}function r(t,e){if(!n||i(n)!==i(e)){t.textContent=d.get(i(e))??"";return}t.innerHTML=`
      <div style="display: grid; gap: 8px">
        <xh-text-field>
          <div data-xh-part="root">
            <label data-xh-part="label">${e.side==="old"?"旧":"新"}第 ${e.line} 行的评论</label>
            <div data-xh-part="control"><input data-xh-part="input" /></div>
          </div>
        </xh-text-field>
        <div style="display: flex; gap: 8px">
          <xh-button size="sm"><button data-xh-part="root" data-action="save">保存</button></xh-button>
          <xh-button size="sm" variant="ghost"><button data-xh-part="root" data-action="cancel">取消</button></xh-button>
        </div>
      </div>`;const a=t.querySelector("input");a.value=d.get(i(e))??"",t.querySelector('[data-action="save"]').addEventListener("click",()=>{a.value.trim()!==""&&d.set(i(e),a.value.trim()),n=null,s()}),t.querySelector('[data-action="cancel"]').addEventListener("click",()=>{n=null,s()})}function s(){l();for(const t of o.querySelectorAll('[data-part="comment-thread"]')){const[e,a]=t.dataset.value.split(":");r(t,{side:e,line:Number(a)})}}o.addEventListener("comment-mount",t=>r(t.detail.element,t.detail)),o.addEventListener("comment-request",t=>{n={side:t.detail.side,line:t.detail.line},s()}),l()}export{u as default};
