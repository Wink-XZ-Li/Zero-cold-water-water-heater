# Implementation Plan: 零冷水定时（设置定时）

**Branch**: `002-zero-cold-schedule` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-zero-cold-schedule/spec.md`

## Summary

将首页「零冷水预热」入口从占位页替换为云定时列表/编辑流。采用业务层「定时组」模型：每组两个云 Timer（开始 `dps["104"]=true`、结束 `false`），以相同 `aliasName` 成组；API 使用 Ray DeviceKit `syncTimerTask` / `addTimer` / `updateTimer` / `updateTimerStatus` / `removeTimer`。交互对齐米家时间段定时（Ardot `57:4`/`57:5`），视觉复用 001 伊莱克斯主题变量。`isAppPush` 默认 `false`；删除二次确认。

## Technical Context

**Language/Version**: TypeScript ^4.4.3（严格模式，禁止无必要 `any`）

**Primary Dependencies**: `@ray-js/ray` ^1.7.55（`device.*` Timer API）、`@ray-js/smart-ui` ^2.7.2（NavBar、Switch、Dialog、DatetimePicker/ActionSheet 等）、`@ray-js/panel-sdk` ^1.14.1；涂鸦 Skill（RayCommon / SmartUI）按需启用

**Storage**: 无本地业务库；配对关系存于云 Timer 的 `aliasName`；列表以 `syncTimerTask` 为准

**Testing**: 涂鸦 MiniApp IDE + 真机/虚拟设备联调 Timer API；ESLint；`ray build --target tuya`；对照米家信息结构截图（SC-004）

**Target Platform**: 涂鸦智能生活 App ≥4.5.0；DeviceKit Timer API（项目依赖已含）

**Project Type**: 涂鸦 Ray 面板小程序（`panel-app`）

**Performance Goals**: 列表首屏（含 sync）可交互 <3s（正常网络）；成对增删改用户可感知失败不超过一次 Toast/Dialog

**Constraints**: 成对写失败必须回滚/纠偏；不用 `openTimerPage`；不用米家品牌色；中文 commit；单设备；`category=zc_schedule` 固定

**Scale/Scope**: 2 个业务页（列表 + 编辑）替换占位页；1 个 Timer 服务模块；首页入口改导航

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. SDM 工程 | ✅ PASS | 仍用现有 `SmartDeviceModel`；Timer 为 DeviceKit 云 API，不绕过 Schema；104↔`zc_always_on` |
| II. 设计驱动 | ✅ PASS* | 伊莱克斯正式稿暂无定时二级帧；交互以用户指定米家截图为权威，视觉 token 复用 001；禁止自创信息架构 |
| III. Skill 优先 | ✅ PASS | Timer/Dialog/Picker 走 SmartUI + Ray API；参考燃气热水器品类面板 |
| IV. 读取优先 | ✅ PASS | 改路由/入口/新页前先读现有文件 |
| V. Ray & SmartUI | ✅ PASS | NavBar/Switch/Dialog；ScrollView 高度模式沿用 001 修复 |
| VI. DP 安全 | ✅ PASS | Timer 只写 104 bool；不写 003 范围 DP |
| Git 中文提交 | ✅ PASS | subject/body 中文 |

\* 宪章原文以 Figma MCP 为权威；本 feature 经用户确认用米家截图补交互缺口，属已批准例外，正式伊莱克斯帧到位后做视觉替换任务。

**Gate Result**: ALL PASS（含已记录设计例外）— 可进入 Phase 0 / Phase 1

**Post-design re-check**: 合约与数据模型未引入宪章违规；Complexity Tracking 为空。

## Project Structure

### Documentation (this feature)

```text
specs/002-zero-cold-schedule/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── timer-group.md
│   └── pages.md
├── checklists/requirements.md
└── tasks.md             # /speckit.tasks 产出
```

### Source Code (repository root)

```text
src/
├── api/
│   └── timer.ts                 # DeviceKit Timer Promise 封装
├── utils/
│   └── timer-group.ts           # aliasName 生成、配对、校验、半组检测
├── pages/
│   ├── home/                    # 入口改 navigate 到定时列表
│   ├── zero-cold-schedule/      # 新建：定时列表（替换占位语义）
│   │   ├── index.tsx
│   │   ├── index.module.less
│   │   └── index.config.ts
│   └── zero-cold-schedule-edit/ # 新建：时间段新增/编辑
│       ├── index.tsx
│       ├── index.module.less
│       └── index.config.ts
├── components/
│   ├── zero-cold-entry/         # 文案可保留「预热」，导航改列表
│   ├── schedule-group-item/     # 列表行：时段+loops+开关+左滑删除
│   └── schedule-edit-form/      # 重复/开启/关闭/isAppPush 表单（可内联页面）
├── hooks/
│   └── useTimerGroups.ts        # sync + 归组 + 刷新
├── i18n/strings.ts              # 列表/编辑/确认/错误文案
└── routes.config.ts             # 注册列表与编辑路由；占位路由可重定向或删除
```

**Structure Decision**: 保持 Ray 单仓；用新页面替换 `zero-cold-placeholder` 业务角色（可保留文件做 redirect 一版，或直接改路径——实现任务中选「改路由到新页并删除占位」以减债）。

## Complexity Tracking

> 无 Constitution 违规需额外论证。
