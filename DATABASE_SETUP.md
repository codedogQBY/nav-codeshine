# 数据库设置指南

## 环境配置

1. 确保 MySQL 数据库已安装并运行
2. 创建数据库 `nav_codeshine`：
```sql
CREATE DATABASE nav_codeshine CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. 在 `.env` 文件中配置数据库连接：
```
DATABASE_URL="mysql://用户名:密码@localhost:3306/nav_codeshine"
ZHIPU_API_KEY="你的智谱API密钥"
```

## 数据库初始化

运行以下命令来初始化数据库：

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库模式到 MySQL
npm run db:push

# 填充初始数据
npm run db:seed

# 或者一键设置（推荐）
npm run db:setup
```

## 可用的数据库命令

- `npm run db:generate` - 生成 Prisma 客户端
- `npm run db:push` - 推送模式到数据库
- `npm run db:migrate` - 创建和应用迁移
- `npm run db:seed` - 填充示例数据
- `npm run db:reset` - 重置数据库并重新填充数据
- `npm run db:setup` - 一键设置数据库

## 智谱 AI 配置

1. 访问 [智谱 AI 开放平台](https://open.bigmodel.cn/)
2. 注册账号并获取 API Key
3. 将 API Key 添加到 `.env` 文件中的 `ZHIPU_API_KEY`

## 数据模型

### Category（分类）
- id: 唯一标识符
- name: 分类名称（唯一）
- icon: 图标名称
- websites: 关联的网站列表

### Website（网站）
- id: 唯一标识符
- url: 网站链接（唯一）
- title: 网站标题
- description: 网站描述
- categoryId: 所属分类ID
- tags: 标签数组（JSON格式）
- favicon: 网站图标
- visitCount: 访问次数
- lastVisited: 最后访问时间

## 功能特性

✅ **已完成的功能:**
- MySQL 数据库集成
- 网站 CRUD 操作
- 分类管理
- 智谱 AI 聊天功能
- 网站分析和推荐
- API 路由完整实现

🔄 **使用方法:**
1. 启动数据库服务
2. 运行 `npm run db:setup` 初始化数据库
3. 配置智谱 AI API Key
4. 运行 `npm run dev` 启动开发服务器

现在项目已经从本地存储迁移到了 MySQL 数据库，并集成了智谱 AI 服务！