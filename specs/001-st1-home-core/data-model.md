# Data Model: ST1 Pro 首页核心能力

**Phase**: 1 — Design  
**Date**: 2026-08-12  
**Source**: Debugfile ST1 Pro（Pro_Key `a3cbezgki7lkl8rr`）

## 实体关系（逻辑）

```text
DeviceCapability (DP)
    ├── HomeMainControls（首页主控读写/只读）
    ├── FaultSummary（由 fault 派生）
    ├── ZeroColdEntrySummary（只读摘要）
    └── PlaceholderPage（无持久实体，仅导航与文案）
```

## 首包 DP（首页绑定）

| Code | 名称 | 类型 | 模式 | 约束 | 首页用途 |
|------|------|------|------|------|----------|
| `switch` | 开关 | bool | rw | — | 电源 |
| `mode` | 工作模式 | enum | rw | `no_mode`/`eco`/`kitchen`/`bath`/`auto_temp` | 模式选择 |
| `temp_set` | 设置温度 | value | rw | min=35 max=65 step 默认 1，scale=0 | 设定温度 |
| `temp_current` | 出水温度 | value | ro | min=-30 max=100，scale=0 | 只读展示 |
| `work_state` | 工作状态 | enum | ro | `off`/`standby`/`bath_heating`/`zc_heating` | 状态文案 |
| `fault` | 故障告警 | bitmap | rw* | label 见下表 | 故障摘要（面板侧按只读展示；不主动写故障） |
| `flame_state2` | 火焰状态 | bool | ro | — | 条件展示（Figma 有则绑） |
| `flow_state2` | 水流状态 | bool | ro | — | 条件展示（Figma 有则绑） |
| `once_zero_cold` | 单次零冷水 | bool | rw | — | 入口只读摘要；首包不提供完整调节 UI |
| `zc_always_on` | 零冷水常开 | bool | rw | — | 入口只读摘要；定时细节属 002 |

\*产品定义为 rw；首包 UI **不得**提供清除/写入故障的操作，除非后续规格明确。

## 条件纳入（设计稿出现才绑定）

| Code | 说明 |
|------|------|
| `inlet_temp` | 进水温度，scale=0 |
| `draught_fan_state` | 风机状态 |

## 明确不进首页完整交互（Schema 仍可生成，UI 不暴露调节）

`turbo`, `zero_cold_jog_switch`, `once_zero_cold_keep_time`, `var_cap`, `bath_flow_set`, `zc_return_diff`, `bath_heat_done_alert`, `gas_consumption`, `water_total`

## 枚举显示（i18n）

### mode

| Value | 建议中文 | 建议英文 |
|-------|----------|----------|
| no_mode | 无模式 | No Mode |
| eco | 节能 | Eco |
| kitchen | 厨房 | Kitchen |
| bath | 洗澡 | Bath |
| auto_temp | 恒温 | Auto Temp |

### work_state

| Value | 建议中文 | 建议英文 |
|-------|----------|----------|
| off | 关机 | Off |
| standby | 待机 | Standby |
| bath_heating | 洗澡加热 | Bath Heating |
| zc_heating | 零冷水加热 | Zero-Cold Heating |

## fault bitmap

| Bit | Label |
|-----|-------|
| 0 | E0 |
| 1 | E1 |
| 2 | E2 |
| 3 | E3 |
| 4 | E4 |
| 5 | E5 |
| 6 | E6 |
| 7 | E7 |
| 8 | E8 |
| 9 | EH |
| 10 | En |
| 11 | Eb |
| 12 | Ec |

**解析**: `fault.toString(2).padStart(13,'0').split('').reverse()`，为 `1` 的位映射到 label。  
**FaultSummary**: `{ codes: string[]; hasFault: boolean }`

## 校验规则

| 规则 | 说明 |
|------|------|
| temp_set 写入 | `value` 必须 ∈ [schema.min, schema.max]；越界夹紧并提示 |
| mode 写入 | 必须 ∈ property.range |
| switch 写入 | boolean |
| 只读保护 | `temp_current`/`work_state`/`flame_state2`/`flow_state2`/`inlet_temp`/`draught_fan_state` 禁止 actions 写入 |
| scale | 本产品温控相关 scale=0，显示值=原始值；工具函数仍统一走 `10^scale` 以免后续变更 |

## 状态与 UI 关系（首页）

- `work_state` 驱动状态文案区
- `fault.hasFault===true` 时展示故障横幅/区，不替换全部主控（规格：不阻断其他状态）
- `work_state==='zc_heating'` 仅影响文案，不解锁定时编辑
