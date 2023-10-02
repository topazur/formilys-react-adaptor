---
nav:
  title: 筛选类表单
  order: 1
group:
  title: 带操作符
  order: 1
---

# Operator Demo

- 建议传递 IFormatter，组件会通过 useExpressionScope 去获取该scope。
  - 没传递的话默认渲染key；
  - 如果 type 为 tootip ，其返回值的有无决定是否显示 tooltip；

- 给 Reset 组件传递了 onReset 事件，表单的默认的重置到初始值失效，你可以自定义重置逻辑。

- conditions 是需要维护的 state，可能来自于后端、本地存储、组件状态等；definitionFields 是预定义的字段配置。
  - `ISchema`: 显示的字段通过比对 definitionFields 和 conditions 来显示(逻辑封装在组件内部)；
  - `遍历`: 以 conditions 为主，但是若 field 不是在 definitionFields 预定义的字段，表示是非法字段，也会被抛弃
  - `初始值`: 初始值可通过提供的方法 getInitialValue 来计算，在业务层自由发挥即可；
  - `初始值`: 如果传入字段的操作符不在预定义操作符列表中，则使用预定义字段的默认操作符
  - `初始值`: 根据预定义的 isMultiple 字段判断是否是数组，如果不是默认取第 0 项

<code src="../demos/operator/Schema.tsx"></code>
