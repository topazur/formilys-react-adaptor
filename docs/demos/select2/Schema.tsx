import React from 'react'
import { Select2 } from '@odinlin/formily-antd/src/select2'

import { loadData } from './helper'

import type { RefSelectProps } from 'antd'

function Demo() {
  const [value, setValue] = React.useState<any>({
    value: 'testValue_null_1',
    label: 'testValue_null_1',
  })
  const onChange = (val, option) => {
    setValue(val)
  }

  const [open, setOpen] = React.useState(false)
  const onOpenChange = (val) => {
    setOpen(val)
  }

  return (
    <div>
      <ul>

        <h3>一、受控</h3>

        <li>
          <h6>
            <div>双向绑定value: {JSON.stringify(value)}</div>
            <button onClick={() => setValue({ value: 'testValue_null_2', label: 'testValue_null_2' })}>
              外部更改：set value
            </button>
          </h6>
          <Select2
            style={{ width: 300 }}
            showSearch={false}
            value={value}
            onChange={onChange}
            loadData={(signal, opts) => loadData('testValue', signal, opts)}
          />
        </li>

        <li>
          <h6>
            <div>受控open: {JSON.stringify({ open })} ==&gt; 外部控制首次打开也会加载</div>
          </h6>
          <Select2
            style={{ width: 300 }}
            showSearch={false}
            open={open}
            onDropdownVisibleChange={onOpenChange}
            loadData={(signal, opts) => loadData('testOpen', signal, opts)}
          />
        </li>

        <h3>二、load情况</h3>

        <li>
          <h6>
            <div>不可搜索（此时默认首次打开下拉框加载）==&gt; 可以保留上次请求结果</div>
          </h6>
          <Select2
            style={{ width: 300 }}
            showSearch={false}
            loadData={(signal, opts) => loadData('testLoad-one', signal, opts)}
          />
        </li>

        <li>
          <h6>
            <div>可搜索（firstLoad=true 开启首次打开下拉框加载 ==&gt; 每次打开都要重新搜索</div>
          </h6>
          <Select2
            style={{ width: 300 }}
            showSearch={true}
            firstLoad={true}
            loadData={(signal, opts) => loadData('testLoad-two', signal, opts)}
          />
        </li>

        <li>
          <h6>
            <div>可搜索（firstLoad=false 关闭首次打开下拉框加载 ==&gt; 每次打开都要重新搜索</div>
          </h6>
          <Select2
            style={{ width: 300 }}
            showSearch={true}
            firstLoad={false}
            loadData={(signal, opts) => loadData('testLoad-three', signal, opts)}
          />
        </li>

      </ul>
    </div>
  )
}

export default Demo
