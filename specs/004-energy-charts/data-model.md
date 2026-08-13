# Data Model: 004 能耗报告曲线与统计

## EnergyMetric

| 字段 | 类型 | 说明 |
|------|------|------|
| id | `'water' \| 'gas'` | 当前选中用量类型 |
| dpCode | string | `water` → `water_total`；`gas` → `gas_consumption` |
| dpId | number | `25` / `24` |
| unit | string | `L` / `m3` |
| titleKey | string | 图表标题 i18n key |

**默认**: `water`

## EnergyPeriod

| 字段 | 类型 | 说明 |
|------|------|------|
| id | `'day' \| 'week' \| 'month' \| 'year'` | UI 周期 |
| chartRange | `'1hour' \| '1day' \| '1month'` | StatCharts `range`（见 research R3） |

**默认**: `day`  
**规则**: 切换 metric 时保持 period

## EnergyAnchorDate

| 字段 | 类型 | 说明 |
|------|------|------|
| value | Date / dayjs | 当前锚点（日视图为具体日；周为窗口末日；月/年为所在月/年） |
| label | string | 展示文案，如 `2026/08/04`；周可为 `MM/DD - MM/DD` |

**导航**: 左右切换按 period 步进；不得导航到未来超出「今天」的锚点（与 Softener 一致）

## EnergySeries（逻辑实体；StatCharts 内部也可自拉）

| 字段 | 类型 | 说明 |
|------|------|------|
| metric | EnergyMetric.id | |
| period | EnergyPeriod.id | |
| anchor | EnergyAnchorDate | |
| points | `{ label: string; value: number \| null }[]` | 有序点；未来时段可空 |
| source | `'statistics-api'` | 固定，禁止 mock |

若使用 StatCharts 内置拉数，页面层可不物化 `points`，但仍须可区分空/有数据/失败。

## EnergyReportViewState

| 状态 | 条件 | UI |
|------|------|-----|
| loading | 请求中 | 图表区 loading/占位 |
| success | 有有效点 | 绘制曲线/柱 |
| empty | 成功但无用量 | 空网格 + 说明 |
| error | 网络/API 失败 | 错误文案，可返回 |

## DP 子集（本 feature 只读）

| code | id | 类型 | 模式 | scale | unit | 用途 |
|------|-----|------|------|-------|------|------|
| gas_consumption | 24 | value | ro | 3 | m3 | 用气统计目标 DP |
| water_total | 25 | value | ro | 0 | L | 用水统计目标 DP |

**规则**: MUST NOT 对上述 DP 调用 `useActions` 下发；曲线数据以统计接口为准，不把累计瞬时值当作序列。

## 状态流转

```text
[进入页] → loading → success | empty | error
[切换 metric/period/日期] → loading → success | empty | error
[返回首页] → 销毁本页状态；首页主控不变
```

## 校验

- 禁止随机/伪造序列
- 快速连点：以最后一次选择为准（请求可竞态取消或忽略过期结果）
- 用水视图必须展示 ±15% 误差说明
