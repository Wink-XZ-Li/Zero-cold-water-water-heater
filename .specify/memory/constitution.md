<!--
Sync Impact Report
==================
Version change: softener 1.1.0 → ST1 Pro 1.0.0 (fork retarget)
Forked from: Water-Softener-Speckit-dev3 `.specify/memory/constitution.md` @ 1.1.0
Modified principles:
  - Product retarget: 软水机 → 国内伊莱克斯零冷水燃气热水器 ST1 Pro 面板小程序
  - II. Ardot UI 设计驱动 → II. Figma UI 设计驱动 (design authority: Figma MCP, not Ardot)
  - III. Skill-first local references: gas/boiler/water-heater repos; Softener only as Speckit process reference
  - VI. DP safety: zero-cold / gas water heater DPs (temp_set, fault, once_zero_cold, zc_always_on, turbo, flame/flow) — remove softener regeneration/salt language
  - Workflow: Figma → design tokens → Skill → implement → screenshot compare (Figma + IDE screenshots)
Added/kept: Core Principles I, III, IV, V, Governance, Technology Stack (retargeted)
Removed: Ardot MCP tooling requirements; softener regener/salt/hardness DP language
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check still maps to principles I–VI
  ✅ .specify/templates/spec-template.md — No structural changes
  ✅ .specify/templates/tasks-template.md — No structural changes
Follow-up TODOs: Create first feature under specs/ via Speckit when ready
-->

# 伊莱克斯零冷水燃气热水器 ST1 Pro 面板小程序 Constitution

## Core Principles

### I. 通用智能设备模型工程 (Universal Smart Device Model)

本项目为涂鸦智能生活 App 上基于 **Ray 框架** 的面板小程序，产品为 **国内伊莱克斯零冷水燃气热水器 ST1 Pro**（Pro_Key: `a3cbezgki7lkl8rr`），以通用智能设备模型（Smart Device Model, SDM）为核心架构。

规则：

- 项目结构 MUST 遵循 Ray 框架标准目录布局（`src/devices/`, `src/pages/`,
  `src/components/` 等）。
- 设备数据管理 MUST 使用 `SmartDeviceModel<SmartDeviceSchema>`（单设备场景）或
  `SmartGroupModel<SmartDeviceSchema>`（群组场景）。
- DP（Data Point）Schema MUST 定义在 `src/devices/schema.ts`，类型声明 MUST
  精确反映产品定义的 DP 类型（bool / value / enum / bitmap / string）。
- DP 数据读写 MUST 使用 SDK 的 `useProps` / `useActions` 钩子，MUST 使用精确
  selector（`useProps(p => p.specificDp)`）以避免全量渲染。
- 项目 MUST 同时支持设备模式和群组模式，通过 `isGroupDevice` 动态切换。

**理由**: 通用智能设备模型是涂鸦 Ray 面板的标准架构模式，确保设备控制逻辑一致、
可维护，并兼容涂鸦 IoT PaaS 层通信协议。

### II. Figma UI 设计驱动 (Figma-Driven UI Design) — 不可妥协

所有 UI 开发 MUST 基于 Figma 设计文件进行，禁止自行定义视觉样式。设计权威来源是
**Figma**（NOT Ardot）。

权威设计文件：

- 名称: **国内伊莱克斯零冷水燃气热水器APP-UI方案**
- fileKey: `vkmMZjILzrheBxPiXO8kF4`

规则：

- 每个 UI 页面/组件的开发 MUST 以 Figma 设计稿为起点。使用 Figma MCP 工具
  (`get_design_context`, `get_screenshot`, `get_metadata`) 提取设计结构与视觉规范。
- MUST NOT 使用 Ardot MCP（`capture_layout` / `batch_read` / `fetch_guidelines` 等）
  作为本项目的设计权威来源。
- 颜色、字号、间距、圆角、布局方向等视觉属性 MUST 从 Figma 设计 token / 节点属性中提取，
  MUST NOT 自行估算或硬编码。
- 组件层级结构 MUST 忠实还原设计稿中的 Frame / Auto Layout 嵌套关系。
- 完成 UI 开发后 SHOULD 使用 Figma `get_screenshot` 与用户提供的 IDE/真机截图对比
  设计稿与实现效果。
- 若设计稿中未定义某视觉元素（如暗黑模式颜色），MUST 使用 CSS 变量占位并向用户
  确认，MUST NOT 自行补充。

**理由**: 涂鸦面板的终端用户视觉一致性直接影响品牌体验和产品可用性。Figma 是
本产品设计-开发协作的权威来源，偏离设计稿将导致返工和质量问题。

### III. Skill 优先组件实现 (Skill-First Component Implementation) — 不可妥协

所有组件实现 MUST 优先遵循涂鸦开发 Skill（`tuya-ray-panel-dev`）中的案例和参考链接。

规则：

- 组件选型时，MUST 先查阅 Skill 中的 **Component Selection Guide**（`references/`
  目录下 component-catalog.md、smartui-catalog.md、material-library.md）。
- 实现方式 MUST 优先使用 Skill 中提供的代码案例（包括 DP 读写模式、Svg/Icon 规则、
  Flex 方向陷阱、主题变量等）。
- 若 Skill 中未覆盖某组件的使用方法，MUST 向用户提出明确问题（而非自行猜想），
  由用户解答后，用户将完善 Skill 以供后续复用。
- **本产品本地参考仓库**（优先，路径均在 `/Users/fgt/Documents/GitHub/`）：
  - `Gas-Boiler-codybuddy` — 完整架构模式（pages+setting+curve、Redux+dpKit）
  - `Gas-Boiler-tuya-panel-国内西屋` — 燃气相关面板模式
  - `Gas-Instant-Water-Heater-tuya-panel-MIZUDO` — 即热/热水器面板模式
  - 其他 `电动/燃气热水器` 相关仓库 — 品类交互与 DP 模式参考
- **Softener / Water-Softener-Speckit-dev3** ONLY 作为 Speckit 流程与工具链参考，
  MUST NOT 作为本产品 UI/DP/业务逻辑的实现范本。

**理由**: Skill 是经过验证的最佳实践集合，确保代码风格一致、避免已知陷阱
（如 Flex 方向默认 row、Svg viewBox 比例、Scale 换算等），并减少调试时间。

### IV. 代码尊重 — 读取优先 (Code Respect — Read Before Write) — 不可妥协

在修改任何代码文件之前，MUST 先读取该文件的最新内容。

规则：

- 每次执行 `replace_in_file` 之前，MUST 使用 `read_file` 读取目标文件的最新状态。
- 如果上一条消息中已读取过该文件且至今未超过 5 条消息，可复用缓存内容；
  否则 MUST 重新读取。
- 用户的**手动修改具有最高优先级** — 如果读取到的内容与预期不一致，
  说明用户进行了手动调整，MUST 基于最新内容进行修改，MUST NOT 直接覆盖。
- 禁止使用 `write_to_file` 覆盖用户可能已修改过的文件（除非确认文件未被修改）。

**理由**: 用户可能在 AI 修改后进行手动调整。直接覆盖将丢失用户工作成果，
降低信任感并导致生产力损失。

### V. Ray 框架 & SmartUI 组件规范 (Ray Framework & SmartUI Compliance)

本项目 MUST 严格遵循 Ray 框架的约定和 SmartUI 组件库规范。

#### SmartUI 组件库 — 不可妥协

智能设备模型下的标准 UI 组件 MUST 独占使用 `@ray-js/smart-ui` 提供的内置组件。
仅在以下条件同时满足时，才可自定义实现组件：

1. SmartUI 组件库中不存在所需组件类型；
2. Skill 参考案例中未覆盖该需求；
3. 已向用户确认并获得同意。

规则：

- **布局组件**: `View`、`Text`、`ScrollView`、`Image` MUST 使用 `@ray-js/ray` 内置组件。
- **导航/Tab/弹窗**: `NavBar`、`Tabbar`、`Dialog`、`Picker` 等 MUST 使用 SmartUI 标准组件，
  MUST NOT 自行实现。
- **图表**: `StatCharts`、`CommonCharts` 等 MUST 使用对应物料库包。
- **组件引用方式**: MUST 使用 SmartUI 按需加载（`SmartUIAutoImport`）。

#### 多语言 (i18n) — 不可妥协

所有用户可见文本 MUST 通过 `src/i18n/` 国际化体系管理。

规则：

- 界面静态文本 MUST 定义在 `src/i18n/` 翻译文件中，MUST NOT 硬编码文本。
- DP 枚举值显示 MUST 使用 `Strings.getDpLang()` 转译（而非直接展示枚举原始值）。
- 每新增一个语言 key MUST 覆盖所有支持语言（中文、英文等）。
- 语言切换 MUST 不刷新页面、不清空 DP 状态。

#### 框架约定

- **语言**: TypeScript（严格模式），MUST NOT 使用 `any` 类型（除非 SDK 接口要求）。
- **样式**: CSS Modules（`.module.less`）+ rpx 响应式单位，MUST NOT 使用 px 进行布局。
- **主题**: 所有颜色 MUST 使用 CSS 变量（定义在 `src/styles/index.less` 或 `src/variables.less`），
  支持亮色/暗黑双主题，MUST NOT 硬编码颜色值。
- **Redux**: 仅用于 App/UI 状态管理（systemInfo、theme、appInfo），MUST NOT 用于 DP 数据。
- **错误处理**: 应用入口 MUST 包裹 `RayErrorCatch` 组件。
- **Flex 布局**: `<View>` 组件默认 `flex-direction: row`（React Native 行为）。需要纵向排列的容器
  MUST 显式设置 `display: flex; flex-direction: column`。
- **Svg/Icon**: `Svg` 组件的 `width`/`height` 是直接 props（非 style），比值 MUST 匹配
  `viewBox` 比例以避免重复/拼贴渲染。`Icon` 组件使用 `size` + `color` + `d` 属性，
  内置 rpx2px 转换。

**理由**: SmartUI 是涂鸦官方维护的面板组件库，提供 50+ 标准化组件。独占使用确保：
视觉与 Figma 设计稿一致、暗黑模式自动适配、版本升级兼容性。Ray 框架具有特定行为
约定，不遵守将导致布局错乱、暗黑模式失效、多语言缺失等问题。

### VI. DP 数据正确性与硬件安全 — 不可妥协

DP 值直接控制实体燃气热水器与零冷水回路，任何数据错误都可能导致水温失控、误点火、
故障漏报或零冷水功能异常。本原则确保面板与硬件之间的数据链路正确。

规则：

- **Schema 校验**: DP Schema（`src/devices/schema.ts`）MUST 基于产品描述文件
  （`Debugfile_*.json` 或 Pro_Key `a3cbezgki7lkl8rr` 对应云端/本地 schema）生成，
  MUST NOT 手动猜测 DP 类型、范围或 scale 值。
- **Scale 换算（尤其 `temp_set`）**: 读取 value 类型 DP 时，MUST 应用
  `value / Math.pow(10, scale)` 显示；写入时 MUST 应用
  `displayValue * Math.pow(10, scale)` 回传。Scale 值 MUST 从 schema 的
  `property.scale` 字段获取，MUST NOT 硬编码。温度设定错误会直接影响出水温度。
- **范围约束**: 写入 value 类型 DP 前，MUST 验证数值在 `property.min` ~ `property.max`
  范围内。超出范围的输入 MUST 夹紧至边界值并警告用户。
- **Enum 有效性**: 写入 enum 类型 DP 前，MUST 验证值在 `property.range` 数组内。
  不在范围内的值 MUST NOT 下发。
- **Bitmap 解析（`fault`）**: 故障码 DP MUST 使用二进制位解析
  （`fault.toString(2).padStart(maxlen,'0').split('').reverse()`），
  每位映射到 schema 的 `property.label` 数组以获取可读故障描述；故障态 MUST
  在 UI 上明确展示，MUST NOT 静默忽略。
- **零冷水相关 DP**: `once_zero_cold`、`zc_always_on`、`turbo` 等零冷水/增强相关
  控制 MUST 按 schema 类型正确读写；触发型 bool MUST 使用
  `actions['dpCode'].set(true, { immediate: true })` 确保立即下发，
  MUST NOT 依赖默认的批量下发策略。
- **燃烧/水流状态**: `flame`、水流/用水相关状态 DP MUST 正确驱动 UI 状态机；
  只读状态 MUST NOT 被写入。写入前 MUST 检查 schema 的 `mode` 字段。
- **只读保护**: `mode: 'ro'` 的 DP MUST NOT 被写入。
- **设备状态感知**: 在故障、熄火保护、或零冷水运行冲突态下，MUST 禁用会导致冲突的
  DP 写入，界面 MUST 给出明确状态提示。

**理由**: 零冷水燃气热水器涉及温度设定、点火/火焰、水流与循环回路。错误的数据处理
可导致：水温失控；故障码漏报 → 设备损坏无人知；零冷水误操作 → 循环泵/加热异常。
这是 IoT 面板最底层的安全约束。禁止沿用软水机的再生/盐耗/硬度语言与逻辑。

---

## 技术栈 (Technology Stack)

| 类别 | 技术 | 版本/说明 |
|------|------|-----------|
| 产品 | 伊莱克斯零冷水燃气热水器 ST1 Pro | Pro_Key: a3cbezgki7lkl8rr |
| 框架 | Ray (涂鸦自研跨端框架) | @ray-js/ray（见 package.json） |
| 语言 | TypeScript | 严格模式 |
| UI 组件库 | SmartUI | @ray-js/smart-ui |
| 面板 SDK | Panel SDK | @ray-js/panel-sdk |
| 状态管理 | Redux Toolkit + React-Redux | @reduxjs/toolkit |
| 样式方案 | Less + CSS Modules + rpx | 响应式单位 |
| 构建工具 | Ray CLI | @ray-js/cli |
| 设计权威 | Figma | fileKey vkmMZjILzrheBxPiXO8kF4 |
| 代码规范 | ESLint + Commitlint | 涂鸦面板规范 |
| 包管理 | Yarn / npm | 以仓库锁文件为准 |
| 目标平台 | 涂鸦智能生活 App | 4.5.0+ |
| 运行环境 | TTT (BaseKit/MiniKit/DeviceKit/BizKit) | ≥3.0.0（见 project.tuya.json） |

### 平台兼容性硬约束

面板 MUST 满足以下最低运行环境要求，低于此版本的设备无法使用面板，为不可降级的硬约束：

- **App**: 涂鸦智能生活 ≥ 4.5.0
- **TTT**: BaseKit ≥ 3.0.0, MiniKit ≥ 3.0.0, DeviceKit ≥ 3.0.0, BizKit ≥ 3.0.1
- **TTT baseversion** ≥ 2.10.29（以 `project.tuya.json` 声明为准，当前仓库更高）
- **项目配置文件**: `project.tuya.json` MUST 声明上述所有依赖及其最低版本
- **构建检测**: CI/CD MUST 校验 `project.tuya.json` 中的依赖版本不低于上述硬约束
- **包体积**: 构建产物 MUST 通过 `ray build` 且包体积 SHOULD 受控记录

## 开发工作流 (Development Workflow)

### 设计 → 开发流程

```
Figma 设计稿 → MCP 提取设计 Token → Skill 查询组件方案 → 读取现有代码 → 实现 → 截图对比验证
```

1. **设计提取**: 使用 Figma MCP（`get_design_context` / `get_screenshot` / `get_metadata`）
   获取设计结构、颜色、尺寸等 token。
2. **组件选型**: 在 Skill 的 Component Catalog 中查找匹配的设计模式；优先参考燃气/
   热水器本地仓库而非 Softener。
3. **代码读取**: 读取将要修改的目标文件最新状态。
4. **实现**: 基于设计 token + Skill 案例进行代码编写。
5. **验证**: 使用 Figma `get_screenshot` 与用户提供的 IDE/真机截图对比实现效果与设计稿。

### 开发命令

```bash
npx ray start --target tuya    # 启动开发服务器
ray build --target tuya         # 生产构建
npx eslint src --ext .js,.jsx,.ts,.tsx --fix  # 代码检查
```

### 质量关卡

- 所有 UI 元素 MUST 可通过 Figma 设计稿溯源。
- 所有组件实现 MUST 可通过 Skill 参考案例溯源。
- 所有修改 MUST 基于最新读取的代码状态。
- 构建 MUST 零错误（`ray build` 通过）。
- ESLint MUST 零错误。
- DP Schema MUST 与产品描述文件 / Pro_Key schema 一致。
- 所有 DP 写入 MUST 通过范围/有效性校验。

---

## Governance

### 修订流程

1. 提案: 任何核心原则的修改须以文档化提案形式提出，说明修改理由和影响范围。
2. 评审: 提案须经过项目负责人评审。
3. 实施: 修改 Constitution 后，须同步更新受影响的模板文件（plan/spec/tasks templates）
   和项目文档。
4. 记录: 每次修订须在文件顶部的 Sync Impact Report 中记录变更摘要。

### 版本策略

- **MAJOR**: 删除或重新定义核心原则，破坏向后兼容性。
- **MINOR**: 新增原则/章节，或实质性扩展指导内容。
- **PATCH**: 澄清措辞、修正笔误、非语义性调整。

### 合规审查

- 每个 Spec 和 Plan 文件 MUST 在 "Constitution Check" 章节中逐项验证核心原则的遵守情况。
- 任何原则偏离 MUST 在 Complexity Tracking 表格中记录并说明理由。
- AI 在执行任务时 MUST 以本 Constitution 作为最高优先级的行为准则（高于通用 AI 行为偏好）。

**Version**: 1.0.0 | **Ratified**: 2026-08-12 | **Last Amended**: 2026-08-12
