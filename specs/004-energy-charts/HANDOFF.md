# Handoff: 004 能耗报告曲线

**Date**: 2026-08-13  
**Branch**: `004-energy-charts`（从 `003-pro-settings` @ `cff66d9`）  
**Spec**: `specs/004-energy-charts/spec.md`

## 已完成

- 001 首页、002 定时（手测通过）、003 瀑布浴 + 报告页壳（已提交，IDE 手测可补）
- 004 分支已创建；Draft 规格与 checklist 已写

## 待新会话做的事

1. 确认 **FR-008** 数据源：
   - **A**：涂鸦设备统计/日志类 API + Charts（推荐，对齐日周月年）
   - **B**：仅累计 DP `water_total` / `gas_consumption`（无法做真日曲线，只能简化）
2. `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`
3. 设计对照：Ardot file `714289030938546` 节点 `55:1044`

## 参考代码

- 本仓壳页：`src/pages/energy-report/`
- 品类参考：`/Users/fgt/Documents/GitHub/Gas-Boiler-codybuddy/src/pages/curve/`
- Skill：`tuya-ray-panel-dev`（Charts）
