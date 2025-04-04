# Hướng dẫn sử dụng Tailwind CSS trong dự án

## Giới thiệu

Dự án này sử dụng Tailwind CSS kết hợp với CSS hiện có. Chúng tôi đã tùy chỉnh Tailwind để sử dụng các biến CSS có sẵn trong dự án, giúp duy trì tính nhất quán trong thiết kế.

## Cách tiếp cận

Chúng tôi đang sử dụng phương pháp "tùy chỉnh Tailwind với CSS hiện có", điều này có nghĩa là:

1. Các biến CSS trong `:root` vẫn được giữ nguyên
2. Tailwind được cấu hình để sử dụng các biến này
3. Các component mới nên ưu tiên sử dụng class của Tailwind
4. CSS hiện tại vẫn hoạt động bình thường

## Component tùy chỉnh

Chúng tôi đã tạo một số component tùy chỉnh trong `src/assets/css/tailwind-components.css` để bạn có thể sử dụng:

### Buttons

```html
<button class="btn btn-primary">Nút chính</button>
<button class="btn btn-secondary">Nút phụ</button>
<button class="btn btn-outline">Nút viền</button>
```

### Cards

```html
<div class="card">
  <div class="card-header">
    <h3 class="text-lg font-semibold">Tiêu đề</h3>
  </div>
  <div class="card-body">
    Nội dung của card
  </div>
  <div class="card-footer">
    Footer
  </div>
</div>
```

### Form elements

```html
<div class="form-group">
  <label for="name" class="form-label">Tên</label>
  <input type="text" id="name" class="form-input" placeholder="Nhập tên">
</div>
```

## Sử dụng các màu tùy chỉnh

Thay vì sử dụng mã màu trực tiếp, hãy sử dụng các màu đã được tùy chỉnh:

```html
<!-- Thay vì -->
<div class="bg-blue-500 text-white"></div>

<!-- Sử dụng -->
<div class="bg-primary text-white"></div>
```

## Các class Tailwind thường dùng

### Layout
- `flex`, `flex-col`, `items-center`, `justify-between`
- `grid`, `grid-cols-2`, `grid-cols-3`
- `p-4`, `px-4`, `py-2`, `m-4`, `mx-auto`

### Typography
- `text-lg`, `text-xl`, `font-bold`, `font-medium`
- `text-text-primary`, `text-text-secondary`

### Borders & Shadows
- `rounded`, `rounded-lg`, `border`, `border-border`
- `shadow-custom`

### Interactive
- `hover:bg-primary`, `focus:ring-2`, `active:bg-opacity-90`

## Quy trình làm việc

1. **Đối với component mới**:
   - Sử dụng các class Tailwind trực tiếp
   - Hoặc tạo các component tùy chỉnh mới trong `tailwind-components.css`

2. **Đối với component hiện có**:
   - Tiếp tục sử dụng CSS hiện tại
   - Khi cần sửa đổi, có thể dần dần chuyển sang Tailwind

3. **Quy tắc chung**:
   - Sử dụng biến CSS cho các giá trị thiết kế chính
   - Ưu tiên class Tailwind cho các thay đổi nhỏ và nhanh
   - Sử dụng `@apply` cho các pattern lặp lại

## Lệnh hữu ích

- Chạy ứng dụng: `ng serve`
- Xem ứng dụng tại: `http://localhost:4200`

## Tài liệu tham khảo

- [Tailwind CSS Documentation](https://v3.tailwindcss.com/docs)
- [Angular + Tailwind CSS Guide](https://v3.tailwindcss.com/docs/guides/angular) 