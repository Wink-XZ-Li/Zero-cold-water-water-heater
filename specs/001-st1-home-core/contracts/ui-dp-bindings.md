# UI-DP 绑定合约：ST1 Pro 首页核心

**Phase**: 1 — Design  
**Date**: 2026-08-12

本文档定义首页/占位相关 UI 与 DP 的读写合约。实现时 MUST 使用精确 `useProps` selector。

---

## 1. 电源开关 (PowerSwitch)

| 属性 | 绑定 |
|------|------|
| **数据源** | `switch` |
| **读取** | `useProps(p => p.switch)` |
| **写入** | `actions.switch.set(nextBool)` |
| **校验** | boolean |
| **禁用** | 设备离线时禁用并提示（若 SDK 可感知） |

---

## 2. 工作模式 (ModeSelector)

| 属性 | 绑定 |
|------|------|
| **数据源** | `mode` |
| **读取** | `useProps(p => p.mode)` |
| **写入** | `actions.mode.set(value)` |
| **选项** | `no_mode` / `eco` / `kitchen` / `bath` / `auto_temp` |
| **校验** | value ∈ schema.range |
| **展示** | `Strings.getDpLang('mode', value)` 或等价 i18n |

---

## 3. 设定温度 (TempSetControl)

| 属性 | 绑定 |
|------|------|
| **数据源** | `temp_set` |
| **读取** | `useProps(p => p.temp_set)` → 显示值 = raw / 10^scale（当前 scale=0） |
| **写入** | 先夹紧到 [min,max] 再 `actions.temp_set.set(raw)` |
| **范围** | schema property：35–65 |
| **非法输入** | 不发 DP；UI 回弹/夹紧 + 可理解提示 |

---

## 4. 出水温度 (TempCurrentDisplay)

| 属性 | 绑定 |
|------|------|
| **数据源** | `temp_current` |
| **读取** | `useProps(p => p.temp_current)` |
| **写入** | **禁止** |
| **缺失** | 显示 `--` 或上次有效值（二选一，实现时在组件内统一，默认 `--`） |

---

## 5. 工作状态 (WorkStateDisplay)

| 属性 | 绑定 |
|------|------|
| **数据源** | `work_state` |
| **读取** | `useProps(p => p.work_state)` |
| **写入** | **禁止** |
| **展示** | i18n 映射 off/standby/bath_heating/zc_heating |

---

## 6. 故障摘要 (FaultBanner)

| 属性 | 绑定 |
|------|------|
| **数据源** | `fault` |
| **读取** | `useProps(p => p.fault)` → `useFaultSummary` |
| **写入** | 首包 **禁止** UI 写故障 |
| **展示** | `hasFault===false` 不渲染主故障态；否则展示 codes 摘要 |
| **解析** | 见 [data-model.md](../data-model.md) |

---

## 7. 火焰 / 水流（条件）

| 属性 | 绑定 |
|------|------|
| **数据源** | `flame_state2`, `flow_state2` |
| **读取** | 精确 selector |
| **写入** | **禁止** |
| **条件** | 仅当 Figma 首页存在对应节点时挂载组件 |

---

## 8. 零冷水入口 (ZeroColdEntry)

| 属性 | 绑定 |
|------|------|
| **数据源** | `once_zero_cold`（开关）；`零冷水预热` 为导航入口 |
| **读取** | `useProps(p => p.once_zero_cold)` |
| **写入** | 允许首页开关写 `once_zero_cold`（对齐 Ardot 55:817）；**禁止**写常开细则/回差/点动/保温时长（属 002） |
| **导航** | 点击「零冷水预热」→ `navigateTo` 占位页 |

---

## 9. 占位页 (ZeroColdPlaceholderPage)

| 属性 | 绑定 |
|------|------|
| **数据源** | 无业务 DP 写入 |
| **行为** | 展示「设置定时后续开放」文案；返回首页 |
| **禁止** | 云定时 API、常开细则编辑、回差/点动/保温时长调节 |
