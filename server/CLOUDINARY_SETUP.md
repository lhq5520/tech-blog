# Cloudinary 配置说明

## 1. 注册 Cloudinary 账号

1. 访问 [Cloudinary 官网](https://cloudinary.com/)
2. 注册免费账号（免费版有 25GB 存储空间和 25GB 流量/月）
3. 登录后进入 Dashboard

## 2. 获取 API 凭证

在 Cloudinary Dashboard 中，你可以找到以下信息：
- **Cloud Name**: 在 Dashboard 顶部显示
- **API Key**: 在 Dashboard 的 "Account Details" 部分
- **API Secret**: 在 Dashboard 的 "Account Details" 部分（点击 "Reveal" 显示）

## 3. 配置环境变量

在你的 `.env.local` 文件中添加以下环境变量：

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 4. 功能特性

配置完成后，图片上传将自动：
- ✅ 上传到 Cloudinary 云存储
- ✅ 自动优化图片质量
- ✅ 自动转换为 WebP 格式（浏览器支持时）
- ✅ 通过 CDN 加速访问
- ✅ 存储在 `blog-images` 文件夹中便于管理

## 5. 注意事项

- 免费版有使用限制，但足够个人博客使用
- 图片会自动优化，减少存储空间和加载时间
- 所有图片都通过 HTTPS 安全传输
- 可以在 Cloudinary Dashboard 中管理所有上传的图片
