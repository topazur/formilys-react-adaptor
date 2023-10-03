import React from 'react'
import { Select2 } from '@odinlin/formily-antd/src/select2'

function Demo() {
  const loadData = async (prefix: string, q: string, offset: number) => {
    return new Promise<any[]>((resolve, reject) => {
      setTimeout(() => {
        if (offset > 30) {
          resolve([])
          return
        }
        resolve(Array(10).fill(`${prefix}_${q}_`).map((item, idx) => {
          return {
            value: `${item}${offset + idx}`,
            label: `${item}${offset + idx}`,
          }
        }))
      }, 1000)
    })
  }

  const [value, setValue] = React.useState<any>({
    value: 'test1___1',
    label: 'test1___1的label',
  })

  return (
    <div>

      <h3>不可搜索（此时默认首次打开下拉框加载）；回显示例 - 建议开启 labelInValue 便于回显</h3>
      <Select2
        style={{ width: 300 }}
        showSearch={false}
        loadData={(q, offset) => loadData('test1_', q, offset)}
        value={value}
        onChange={setValue}
      />

      <h3>可搜索（firstLoad=true 开启首次打开下拉框加载）</h3>
      <Select2
        style={{ width: 300 }}
        firstLoad={true}
        showSearch={true}
        loadData={(q, offset) => loadData('test2_', q, offset)}
      />

      <h3>可搜索（firstLoad=false 关闭首次打开下拉框加载）</h3>
      <Select2
        style={{ width: 300 }}
        firstLoad={false}
        showSearch={true}
        loadData={(q, offset) => loadData('test3_', q, offset)}
      />
    </div>

  )
}

export default Demo
