# Research: ST1 Pro 首页核心能力

**Phase**: 0 — Technical Research  
**Date**: 2026-08-12

## 1. 物模型接入方式

**Decision**: 以 `Debugfile_国内伊莱克斯燃气热水器 ST1 Pro_20260812` 为唯一 Schema 源，生成 `SmartDeviceSchema`，替换模板中的 `switch_1` 示例。

**Rationale**: 宪章 VI 要求 Schema 来自产品描述文件；模板默认 schema 与 ST1 Pro 无关。Pro_Key=`a3cbezgki7lkl8rr`，共 21 个 DP，首包只绑定其中主控子集。

**Alternatives considered**:
- 手工猜测 DP：违反宪章，否决
- 运行时反射云端 schema 而不写本地类型：类型安全差，否决

## 2. Figma 设计提取时机

**Decision**: 计划阶段锁定 fileKey=`vkmMZjILzrheBxPiXO8kF4`、用户给出的入口 node `55:241`（URL `node-id=55-241`）；**实现首页 UI 前**必须完成 Figma MCP 鉴权并用 `get_design_context` / `get_screenshot` 提取首页与入口相关节点 token。当前会话 Figma MCP 仅暴露 `mcp_auth`，视为「实现前门禁」。

**Rationale**: 宪章 II 以 Figma 为权威；计划不臆造颜色/间距。`flame_state2`/`flow_state2`/`inlet_temp`/`draught_fan_state` 是否上首页以设计稿为准（规格 FR-007 与 Assumptions）。

**Alternatives considered**:
- 先按燃气热水器通用布局硬编码再对齐：易返工，否决
- 改用 Ardot：与本项目宪章冲突，否决

## 3. 温度控件交互

**Decision**: 设定温度使用 SmartUI/Ray 体系内已有选择器或滑块模式（以 Figma 与 Skill 案例为准）；写入前经 `useTempSetGuard` 夹紧到 35–65（scale=0，原值即摄氏度）。

**Rationale**: `temp_set`/`temp_current` scale 均为 0，无需 /10；越界必须不可下发（SC-003）。

**Alternatives considered**:
- 自由 Input 无校验：不安全，否决
- 在 UI 层写死 35–65 而不读 schema：与宪章「从 property 取值」冲突，否决（实现时从 schema 读 min/max，Debugfile 校验为 35–65）

## 4. 故障展示

**Decision**: `fault` 按 bitmap 解析，label 顺序：`E0,E1,E2,E3,E4,E5,E6,E7,E8,EH,En,Eb,Ec`；首页展示「当前置位故障码列表/首个+数量」级摘要，不做百科页。

**Rationale**: 规格要求可读摘要且不阻断其他状态；完整诊断属 Out of Scope。

**Alternatives considered**:
- 仅展示原始整数：不可读，否决
- 首包做完整故障说明页：超范围，否决

## 5. 零冷水入口与占位页

**Decision**: 首页入口只读展示 `once_zero_cold`、`zc_always_on`（若设计需要）；点击 `navigateTo` 占位页路由（如 `/pages/zero-cold-placeholder/index`）。占位页文案说明「设置定时」后续版本开放；不写定时云 API。

**Rationale**: Grill A + 占位路由 A；002 承接设置定时。

**Alternatives considered**:
- Toast 不建路由：002 仍要改首页结构，否决
- 首包直接做定时：超出 001，否决

## 6. 参考仓库与组件策略

**Decision**: 架构与 DP 模式参考 `Gas-Boiler-codybuddy` / `Gas-Boiler-tuya-panel-国内西屋` / `Gas-Instant-Water-Heater-tuya-panel-MIZUDO`；导航与简单卡片可参考软水机仓库但**不**复制其再生业务。组件优先 SmartUI（NavBar、Button、Dialog 等），温度环/特殊视觉仅在 SmartUI+Skill 不足且用户确认后自定义。

**Rationale**: 宪章 III；热水器品类更接近壁挂炉/即热面板而非软水机。

## 7. 群组模式

**Decision**: 保留模板 `isGroupDevice` 分支以通过编译与宪章 I，但首包不设计群组专属 UI（规格 Assumptions）。

**Rationale**: 降低范围；群组交互 Out of Scope。

## 8. 验证策略

**Decision**: IDE 虚拟设备覆盖主控 DP；视觉以 Figma 截图 + 用户 IDE 截图对照；`yarn lint` + `ray build` 作为合并前门禁。

**Rationale**: 涂鸦 IDE WebView 不可用浏览器 CDP 自动化（Skill 说明）。


## 附录：Figma 拉取（实现阶段）

见 `docs/design/figma-nodes.md`。鉴权成功但设计读取工具未就绪；首页以主题变量落地，视觉对齐挂起。
