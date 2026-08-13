# Contract: Page Shell Spacing & NavBar

## Content shell

各可滚动主内容容器对齐首页：

```less
padding: 32rpx 32rpx 120rpx;
gap: 32rpx; // 若用 flex column 排布主块
```

适用页：

- `src/pages/home`
- `src/pages/energy-report`
- `src/pages/zero-cold-schedule`
- `src/pages/zero-cold-schedule-edit`

允许卡片内部自有 padding；本契约只管页级内容壳。

## NavBar

| 页 | 期望 |
|----|------|
| home | `leftTextType="home"`（或项目既有） |
| 子页 | `leftArrow` + `onClickLeft → navigateBack` |
| 设计差异 | 稿为纯状态栏；实现保留 SmartUI NavBar → **已接受平台例外** |

不得借此改写定时配对或图表请求逻辑。
