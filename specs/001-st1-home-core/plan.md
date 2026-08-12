# Implementation Plan: ST1 Pro 首页核心能力

**Branch**: `001-st1-home-core` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-st1-home-core/spec.md`

## Summary

在现有 Ray SDM 模板上，按产品物模型（Pro_Key `a3cbezgki7lkl8rr`）生成 Schema 与设备模型，
实现 Figma 对齐的首页主控（开关/模式/设定温度/出水温度/工作状态/故障摘要，以及设计稿含有时的火焰与水流状态），
并预留零冷水入口与「设置定时」占位二级页路由。完整定时与其余设置延后至 002–004。

## Technical Context

**Language/Version**: TypeScript ^4.4.3（严格模式，禁止无必要 `any`）

**Primary Dependencies**: `@ray-js/ray` ^1.7.55, `@ray-js/smart-ui` ^2.7.2, `@ray-js/panel-sdk` ^1.14.1, `@reduxjs/toolkit` ^1.9.3；实现阶段按需启用涂鸦 Skill（RayCommon / SmartUI / PerformanceUxGuard）；Charts 留待 004

**Storage**: N/A（DP 经云端实时同步；首包无本地业务持久化）

**Testing**: 涂鸦 MiniApp IDE 虚拟设备 + 用户提供的 IDE/真机截图对照 Figma `get_screenshot`；ESLint；`ray build --target tuya`

**Target Platform**: 涂鸦智能生活 App ≥4.5.0；TTT BaseKit/MiniKit/DeviceKit ≥3.0.0、BizKit ≥3.0.1；`project.tuya.json` baseversion 已满足硬约束

**Project Type**: 涂鸦 Ray 面板小程序（`panel-app`）

**Performance Goals**: 首页首屏可交互 <2s（虚拟设备在线）；DP 变更到 UI 反映 <500ms；页面进出占位页无卡死

**Constraints**: Figma 设计权威（fileKey `vkmMZjILzrheBxPiXO8kF4`）；CSS Modules + rpx + 主题 CSS 变量；i18n；DP scale/范围/枚举/只读/bitmap 安全；中文 commit；包体积受控

**Scale/Scope**: 2 个页面（首页 + 零冷水占位页）；首包绑定约 8–10 个 DP；单设备模式；不实现 Tabbar 多 Tab 主框架（除非 Figma 首页强制要求且经确认）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. 通用智能设备模型工程 | ✅ PASS | `SmartDeviceModel` + `src/devices/schema.ts` 由 Debugfile 生成；`useProps`/`useActions` 精确 selector |
| II. Figma UI 设计驱动 | ✅ PASS | 首页/占位页以 Figma 为准；实现前 `get_design_context`/`get_screenshot`（需 MCP 鉴权）；禁止自行发明视觉 |
| III. Skill 优先组件实现 | ✅ PASS | 选型走 SmartUI/Ray Catalog；品类参考 `Gas-Boiler-codybuddy`、`Gas-Instant-Water-Heater-tuya-panel-MIZUDO`、`Gas-Boiler-tuya-panel-国内西屋` |
| IV. 代码尊重 — 读取优先 | ✅ PASS | 每次编辑前读取目标文件最新内容 |
| V. Ray & SmartUI 规范 | ✅ PASS | NavBar/Button/Dialog/Picker 等优先 SmartUI；布局用 Ray `View`/`Text`/`ScrollView`；i18n；CSS 变量主题 |
| VI. DP 数据正确性与硬件安全 | ✅ PASS | temp_set 35–65 夹紧；fault bitmap→label；只读 DP 不写；零冷水调节不下沉到首包 |
| Git 提交规范 | ✅ PASS | subject/body 中文；type 前缀可英文 |

**Gate Result**: ALL PASS — 可进入 Phase 0 / Phase 1

**Post-design re-check**: 合约与数据模型未引入宪章违规；Complexity Tracking 为空。

## Project Structure

### Documentation (this feature)

```text
specs/001-st1-home-core/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-dp-bindings.md
│   └── pages.md
├── checklists/requirements.md
└── tasks.md             # /speckit.tasks 产出（本命令不创建）
```

### Source Code (repository root)

```text
src/
├── app.tsx / composeLayout.tsx / routes.config.ts
├── devices/
│   ├── schema.ts              # 由 ST1 Pro Debugfile 重写
│   ├── index.ts               # SmartDeviceModel + dpKit
│   └── protocols/             # 如需协议拦截保留
├── pages/
│   ├── home/                  # 首页主控（改造现有模板页）
│   └── zero-cold-placeholder/ # 零冷水/设置定时占位二级页（新建）
├── components/                # 按 Figma 拆分，示例：
│   ├── power-switch/
│   ├── mode-selector/
│   ├── temp-control/
│   ├── work-state-display/
│   ├── fault-banner/
│   ├── flame-flow-status/     # 仅当设计稿需要
│   └── zero-cold-entry/
├── hooks/
│   ├── useFaultSummary.ts
│   └── useTempSetGuard.ts     # 范围夹紧/提示
├── i18n/                      # 中英文案 + DP 枚举/故障文案
├── utils/
│   └── dp.ts                  # scale/range/enum/bitmap 工具
├── styles/ / variables.less / theme.json
└── redux/                     # 仅 UI 状态，不存 DP
```

**Structure Decision**: 保持 Ray 单仓 SDM 布局；扩展 `pages` 与 `components`，不新增顶层应用目录。物模型源文件建议落入 `docs/product/Debugfile_ST1_Pro.json`（实现任务中拷贝），避免依赖本机 Downloads 路径。

## Complexity Tracking

> 无 Constitution 违规，无需记录。
