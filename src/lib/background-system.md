# Hệ thống Background đơn giản - Budgo

## Tổng quan

Hệ thống background đơn giản sử dụng **một màu chính duy nhất** (`bg-gray-50`) cho toàn bộ ứng dụng, đảm bảo tính nhất quán tối đa và dễ bảo trì.

## Cấu trúc hệ thống đơn giản

### 1. Main Background (Background chính)

```css
/* Background chính - Sử dụng cho tất cả các trang */
.bg-main {
  @apply bg-gray-50;
}
```

**Sử dụng:**
- Tất cả các trang: Home, Dashboard, Trip pages, Group pages
- Tất cả các component containers
- Loading states
- Modal backgrounds

### 2. Alternative Backgrounds (Background phụ)

```css
/* Background trắng - Cho cards và content */
.bg-main-white {
  @apply bg-white;
}

/* Background gradient - Cho special cases */
.bg-main-gradient {
  @apply bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100;
}
```

**Sử dụng:**
- `bg-main-white`: Cards, modals, content areas
- `bg-main-gradient`: Special landing pages (nếu cần)

## Sử dụng trong Code

### 1. Sử dụng trực tiếp CSS classes

```tsx
// Page background - Sử dụng cho tất cả các trang
<div className="bg-main min-h-screen">
  {/* Content */}
</div>

// Card background - Sử dụng cho cards
<Card className="bg-main-white">
  {/* Card content */}
</Card>

// Special cases - Chỉ khi thực sự cần
<div className="bg-main-gradient">
  {/* Special content */}
</div>
```

### 2. Sử dụng Design System tokens

```tsx
import { backgrounds } from '@/lib/design-system';

// Sử dụng main background
<div className={backgrounds.main}>
  {/* Content */}
</div>

<Card className={backgrounds.white}>
  {/* Card content */}
</Card>

// Legacy support (sẽ deprecated)
<div className={backgrounds.page.primary}>
  {/* Content */}
</div>
```

## Migration Guide

### Thay thế tất cả background về một màu duy nhất

```tsx
// Cũ - Tất cả các gradient phức tạp
<div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
<div className="bg-gradient-to-br from-blue-50 to-indigo-100">
<div className="bg-gray-50">

// Mới - Chỉ một class duy nhất
<div className="bg-main">

// Cũ - Các card backgrounds khác nhau
<Card className="bg-gradient-to-r from-green-50 to-emerald-50">
<Card className="bg-white">
<Card className="bg-gray-50">

// Mới - Chỉ hai options
<Card className="bg-main-white">  // Cho cards
<Card className="bg-main">       // Cho containers
```

## Best Practices

1. **Sử dụng `bg-main` cho tất cả**: Đây là background chính cho toàn bộ app
2. **Sử dụng `bg-main-white` cho cards**: Để tạo contrast với background chính
3. **Tránh sử dụng `bg-main-gradient`**: Chỉ dùng cho special cases
4. **Consistent experience**: Tất cả trang đều có cùng background
5. **Easy maintenance**: Chỉ cần sửa 1 class để thay đổi toàn bộ app

## Maintenance

- **Thay đổi màu chính**: Chỉ cần sửa `.bg-main` trong `globals.css`
- **Thêm alternative**: Chỉ thêm khi thực sự cần thiết
- **Testing**: Kiểm tra trên cả light và dark mode
- **Documentation**: Cập nhật file này khi có thay đổi

## Lợi ích của hệ thống đơn giản

1. **Tính nhất quán tuyệt đối**: Tất cả trang đều có cùng background
2. **Dễ bảo trì**: Chỉ cần sửa 1 nơi
3. **Performance tốt hơn**: Ít CSS classes hơn
4. **Dễ hiểu**: Developers mới dễ nắm bắt
5. **Reduced complexity**: Không cần quyết định chọn background nào
