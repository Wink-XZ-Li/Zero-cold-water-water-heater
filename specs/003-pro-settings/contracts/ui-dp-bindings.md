# UI-DP 绑定合约：003 瀑布浴与能耗入口

**Phase**: 1 — Design  
**Date**: 2026-08-13

## 1. 瀑布浴开关 (WaterfallBathEntry)

| 属性 | 绑定 |
|------|------|
| **数据源** | `turbo` |
| **读取** | `useProps(p => !!p.turbo)` |
| **写入** | `actions.turbo.set(nextBool)` |
| **校验** | boolean |
| **禁用** | `disabled`（离线或电源关，由首页传入，与零冷水行一致） |
| **文案** | 标题「瀑布浴」；副文案「开启后可增加用水时的水压」 |
| **设计** | Ardot `55:864` / `55:954` 列表行 |

## 2. 能耗报告入口 (EnergyReportEntry)

| 属性 | 绑定 |
|------|------|
| **数据源** | 无 DP |
| **写入** | 禁止 |
| **交互** | `navigateTo` → `/pages/energy-report/index` |
| **文案** | 「能耗报告」+ 右箭头 |
| **设计** | 同上展开帧末行 |

## 3. 能耗报告页面壳 (EnergyReport page)

| 区域 | 行为 |
|------|------|
| NavBar | 标题「能耗报告」；左箭头 `navigateBack` |
| 用水/用气切换 | 视觉存在；本包禁用或仅本地 UI 态，**不请求数据** |
| 日/周/月/年 | 视觉存在；默认「日」；**不请求数据** |
| 日期行 | 可显示静态/本地日期；左右箭头可不响应或禁用 |
| 图表区 | 空态（无序列、无 Charts 数据绑定） |
| 误差说明 | 只读文案（用水 ±15% 等，对齐设计） |
| 空态提示 | 明确「统计图表将在后续版本提供」或等价文案 |

## 禁止

- 写入 `var_cap` / `bath_flow_set` / `zc_return_diff` / `zero_cold_jog_switch` / `once_zero_cold_keep_time` 等
- 在本 feature 引入用量云查询或 Charts 真实绑定
