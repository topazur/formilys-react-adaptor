export async function loadData(prefix: string, signal: AbortSignal, opts: { q: string; offset: number }) {
  const { q, offset } = opts
  const result = offset >= 20
    ? []
    : Array(10).fill(`${prefix}_${q || 'null'}_`).map((item, idx) => {
      return {
        value: `${item}${offset + idx}`,
        label: `${item}${offset + idx}`,
      }
    })

  return fetch('http://jsonplaceholder.typicode.com/posts', {
    method: 'GET',
    signal,
  }).then(res => result)

  // return new Promise<any[]>((resolve, reject) => {
  //   setTimeout(() => {
  //     resolve(result)
  //   }, 1000)
  // })
}
