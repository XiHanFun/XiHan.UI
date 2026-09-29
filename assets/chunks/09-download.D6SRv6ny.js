async function t(){const e=`export async function retry<T>(run: () => Promise<T>, times = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < times; i++) {
    try {
      return await run()
    }
    catch (error) {
      last = error
    }
  }
  throw last
}`;document.getElementById("code-view-download").code=e,document.getElementById("code-view-download-trigger").data=e}export{t as default};
