# Implementation Plan: ST1 Pro 专业参数（瀑布浴等）

**Branch**: `003-pro-settings` | **Date**: 2026-08-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-pro-settings/spec.md`

## Summary

在首页零冷水区块下方按 Ardot `55:864`/`55:954` 增加「瀑布浴」开关（绑定 DP `turbo`）与「能耗报告」入口；入口导航至新建能耗报告**页面壳**（对照 `55:1044` 信息结构：用水/用气切换位、日周月年区、空图表、误差说明），不绑定真实用量数据。视觉复用 001 主题变量；变升等其余专业参数明确不实现。

## Technical Context

**Language/Version**: TypeScript ^4.4.3（严格模式，禁止无必要 `any`）

**Primary Dependencies**: `@ray-js/ray` ^1.7.55、`@ray-js/smart-ui` ^2.7.2（NavBar、Switch）、`@ray-js/panel-sdk` ^1.14.1（`useProps`/`useActions`）；涂鸦 Skill（RayCommon / SmartUI）按需启用；Charts **本包不启用**

**Storage**: 无本地业务库；瀑布浴状态以设备 DP 为准；报告页无云端查询

**Testing**: 涂鸦 MiniApp IDE + 虚拟设备联调 `turbo`；ESLint；`ray build --target tuya`；对照 Ardot 截图（SC-004）

**Target Platform**: 涂鸦智能生活 App ≥4.5.0；单设备面板

**Project Type**: 涂鸦 Ray 面板小程序（`panel-app`）

**Performance Goals**: 首页新增行不影响首屏可交互；进入报告页壳 <1s（无网络依赖）

**Constraints**: 只写 `turbo` bool；不写变升/浴缸流量等；报告页壳禁用真实数据与 Charts；中文 commit；离线/关机与首页主控同禁用策略

**Scale/Scope**: 首页扩展 2 行 + 1 个能耗报告页面壳；无新云 API

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. SDM 工程 | ✅ PASS | `turbo` 已在 `schema.ts`；读写走 `useProps`/`useActions` 精确 selector |
| II. 设计驱动 | ✅ PASS* | 权威帧 `55:864`/`55:954`/`55:1044`；工具为 Ardot（Figma MCP 不可用时的已批准例外，同 001/002） |
| III. Skill 优先 | ✅ PASS | Switch/NavBar 走 SmartUI；行样式复用 `zero-cold-entry` 模式 |
| IV. 读取优先 | ✅ PASS | 改 home / routes / i18n 前先读现有文件 |
| V. Ray & SmartUI | ✅ PASS | ScrollView 高度模式沿用 001；页面壳用 NavBar + 静态布局 |
| VI. DP 安全 | ✅ PASS | 仅 `turbo`；禁止 003 Out of Scope DP 与 004 数据接口 |
| Git 中文提交 | ✅ PASS | subject/body 中文 |

\* 宪章原文以 Figma 为权威；本仓以 Ardot 同源文件 `714289030938546` 作设计源，属项目既定例外。

**Gate Result**: ALL PASS — 可进入 Phase 0 / Phase 1

**Post-design re-check**: 合约仅增加 `turbo` 与页面壳导航；无宪章违规；Complexity Tracking 为空。

## Project Structure

### Documentation (this feature)

```text
specs/003-pro-settings/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── ui-dp-bindings.md
│   └── pages.md
├── checklists/requirements.md
└── tasks.md             # /speckit.tasks 产出
```

### Source Code (repository root)

```text
src/
├── pages/
│   ├── home/                      # 挂载瀑布浴 + 能耗入口
│   └── energy-report/             # 新建：004 页面壳（空图表）
│       ├── index.tsx
│       ├── index.module.less
│       └── index.config.ts
├── components/
│   ├── zero-cold-entry/           # 保持 002 行为
│   ├── waterfall-bath-entry/      # 新建：瀑布浴开关行
│   └── energy-report-entry/       # 新建：能耗报告导航行
├── i18n/strings.ts                # 瀑布浴/报告壳文案
└── routes.config.ts               # 注册 /energy-report
```

**Structure Decision**: 保持 Ray 单仓；首页用独立小组件并列在 `ZeroColdEntry` 之后（避免把无关能力塞进零冷水组件）；报告页壳独立路由，004 可在同页填数据。

## Complexity Tracking

> 无 Constitution 违规需额外论证。
