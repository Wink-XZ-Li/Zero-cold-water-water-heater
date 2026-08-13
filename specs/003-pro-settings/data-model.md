# Data Model: 003 专业参数

## WaterfallBath（业务展示实体）

| 字段 | 类型 | 说明 |
|------|------|------|
| enabled | boolean | 是否开启瀑布浴（增压） |
| label | string | 固定「瀑布浴」 |
| hint | string | 「开启后可增加用水时的水压」 |

**映射**: `enabled` ↔ DP `turbo`

## EnergyReportShell（页面壳展示实体）

| 字段 | 类型 | 说明 |
|------|------|------|
| metric | `'water' \| 'gas'` | 默认 `'water'`；本包不持久化、不请求数据 |
| period | `'day' \| 'week' \| 'month' \| 'year'` | 默认 `'day'`；本包不请求数据 |
| dateLabel | string | 展示用占位日期文案（可静态或当天本地日期） |
| chartEmpty | true | 恒为空图表 |
| errorHint | string | 「正常运行情况下，用水量监测误差为±15%」类说明（只读） |
| unavailableHint | string | 告知统计尚未开放的空态说明 |

**映射**: 无设备 DP；无云 API。004 将扩展为真实序列数据实体。

## DP 子集（本 feature）

| code | id | 类型 | 模式 | 用途 |
|------|-----|------|------|------|
| turbo | 34 | bool | rw | 瀑布浴开关 |

## 校验规则

- `turbo` 仅 boolean；离线/关机时禁止下发
- 报告页壳不得调用用量统计接口；不得写入任何 DP

## 状态流转

```text
[turbo=false] --用户开--> [下发 true] --上报--> [UI 开]
[turbo=true]  --用户关--> [下发 false] --上报--> [UI 关]
[离线/关机]   --用户拨动--> [拒绝/提示，UI 保持]
```
