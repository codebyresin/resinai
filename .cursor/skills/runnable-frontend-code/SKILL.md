---
name: runnable-frontend-code
description: Generates directly runnable and testable frontend code (HTML/CSS/JS/TS/React) with full file contents, file paths, line comments, and error-prevention notes. Use when the user asks for frontend code, UI components, demo pages, or "可直接运行/可测试" code.
---

# 可直接运行的前端代码生成

当用户需要**可直接运行、可测试**的前端代码（HTML/CSS/JS/TS/React）时，必须按本技能执行，确保每一步都可执行、可理解。

## 必须遵循的规则

1. **提供完整代码**：从第一行到最后一行、无需猜测的完整文件内容。组件需包含所有必要的 `import`。
2. **从简到繁**：优先实现最核心、最简单的版本。需求复杂时，先做基础可运行的「版本 1」，再问「需要我在此基础上添加 XX 功能吗？」。
3. **明确文件位置**：在代码开始前，用明显标注说明文件应保存在项目的哪个路径（例如：`// 文件位置：app/components/Button.tsx`）。
4. **一行一注释**：在复杂或关键代码行后，用 `//` 添加简短中文注释，说明该行作用。
5. **预告常见错误**：在代码后，用【注意】或【可能会遇到的问题】列出 1～3 个新手最可能遇到的报错及解决办法（如：「若出现 'module not found'，请检查第 X 行的包名是否已安装」）。

## 输出格式（严格按此顺序）

每次生成前端代码时，必须按以下顺序组织回复：

### 1. 实现思路

用一两句话说明：将用什么技术、实现什么效果。

### 2. 核心代码

- 提供**完整、可复制粘贴**的代码块。
- 标明**文件名和路径**（在代码块上方或首行注释）。
- 复杂/关键行附带简短中文注释。

### 3. 运行与查看

给出清晰步骤：

- **步骤一**：将代码保存到哪个文件（含完整路径）。
- **步骤二**：需要在终端执行什么命令（如有）。
- **步骤三**：在浏览器中如何访问（例如：打开 `http://localhost:3000/example`）。

### 4. 注意事项

- 关键提醒（依赖、环境、端口等）。
- 排错指南：1～3 个常见报错及对应解决办法。

## 示例结构（供 Agent 参考）

```markdown
### 1. 实现思路
使用 React + TypeScript 实现一个可点击计数的按钮组件，状态由 useState 管理。

### 2. 核心代码
文件位置：`components/CounterButton.tsx`

\`\`\`tsx
"use client";
import { useState } from "react"; // 使用 React 状态

export function CounterButton() {
  const [count, setCount] = useState(0); // 初始值为 0
  return (
    <button onClick={() => setCount((c) => c + 1)}>
      点击次数：{count}
    </button>
  );
}
\`\`\`

### 3. 运行与查看
- 步骤一：将上述代码保存到项目根目录下的 `components/CounterButton.tsx`（本项目即 `d:\resinAI\resinai\components\CounterButton.tsx`）。
- 步骤二：在项目根目录执行 `pnpm install`（若未安装依赖），再执行 `pnpm dev` 启动开发服务器。
- 步骤三：在浏览器打开 `http://localhost:3000`，在引用该组件的页面查看按钮；页面中通过 `import { CounterButton } from "@/components/CounterButton"` 使用。

### 4. 注意事项
- 【注意】若在 Next.js 中使用 `useState`，组件文件需加 `"use client"`。
- 【可能会遇到的问题】若看到 "module not found 'react'"，请在该目录执行 `pnpm install`。
```

## 禁止行为

- 不提供碎片化代码（让用户自行拼凑）。
- 不省略 import 或路径说明。
- 不跳过「运行与查看」或「注意事项」环节。
- 不在未说明的情况下假设用户已安装某依赖或已配置某环境。

## 技术栈约定（与项目一致时）

- 若项目为 Next.js（App Router），组件路径优先使用 `app/`、`components/`；客户端交互组件需加 `"use client"`。
- 若为纯 HTML/CSS/JS，则提供单文件或明确的多文件路径与引用方式。
- 涉及 TypeScript 时，不使用 `any`；可为简单示例省略复杂类型，但需在注意事项中说明。

---

## 本项目约定（resinai）

生成本仓库内可直接运行的代码时，遵循以下约定，路径与命令以本段为准。

| 项目 | 约定 |
|------|------|
| **包管理器** | `pnpm`（安装依赖：`pnpm install`，开发：`pnpm dev`） |
| **框架** | Next.js 16（App Router）、React 19、TypeScript |
| **样式** | Tailwind CSS 4；已有 shadcn/ui 组件可复用 |
| **页面路由** | `app/page.tsx` 为首页，`app/login/page.tsx` 为登录页；新页面放在 `app/xxx/page.tsx` |
| **组件路径** | 通用组件：`components/`；UI 原子组件：`components/ui/`（已有 button、card、input、label、field、separator 等） |
| **工具/库** | `lib/utils.ts`（如 `cn()`）；业务逻辑可放 `lib/` |
| **客户端组件** | 凡使用 `useState`、`useEffect`、事件处理或浏览器 API 的组件，文件顶部加 `"use client";` |
| **本地访问** | 开发服务器默认 `http://localhost:3000`，新路由即 `http://localhost:3000/路由名` |

**路径示例（本项目）**：

- 新页面：`app/示例/page.tsx` → 访问 `/示例`
- 新组件：`components/某组件.tsx`，在页面中 `import { 某组件 } from "@/components/某组件"`
- 使用已有 UI：`import { Button } from "@/components/ui/button";`、`import { Card } from "@/components/ui/card";`

**注意事项（本项目）**：

- 若出现 `module not found`，在项目根目录执行 `pnpm install`。
- 若修改 `app/` 下文件后页面未更新，确认是否保存文件，必要时重启 `pnpm dev`。
- 使用 `@/` 别名时，确认 `tsconfig.json` 中已配置 `paths`（Next.js 默认通常已包含）。
