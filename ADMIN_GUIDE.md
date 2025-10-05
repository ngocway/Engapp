# 🔑 Hướng dẫn sử dụng quyền Admin

## **Danh sách Email Admin:**
Hiện tại các email sau được cấp quyền admin:
- `admin@engapp.com`
- `admin@gmail.com` 
- `test@admin.com`

## **Cách test quyền Admin:**

### **1. Đăng nhập với tài khoản Admin:**
1. Mở ứng dụng: `http://localhost:3000`
2. Click "🛠️ Admin Panel" (nếu chưa đăng nhập)
3. Đăng nhập bằng một trong các email admin ở trên
4. Sau khi đăng nhập, bạn sẽ thấy:
   - Badge "🔑 Bạn đang đăng nhập với quyền Admin" (có hiệu ứng glow)
   - Nút "Tạo đoạn văn mới" ở header
   - Các nút "✏️ Sửa" và "🗑️ Xóa" trên mỗi card đoạn văn
   - Nút "🛠️ Admin Panel" trong header

### **2. Test với User thường:**
1. Đăng xuất khỏi tài khoản admin
2. Đăng nhập với email khác (không phải admin)
3. Bạn sẽ thấy:
   - Không có admin badge
   - Không có nút "Tạo đoạn văn mới"
   - Chỉ có nút "📖 Đọc" trên mỗi card
   - Không có nút "🛠️ Admin Panel"

## **Tính năng Admin:**

### **✅ Chỉ Admin mới có:**
- ➕ Tạo đoạn văn mới
- ✏️ Sửa đoạn văn
- 🗑️ Xóa đoạn văn (có xác nhận)
- 🛠️ Truy cập Admin Panel

### **👤 User thường chỉ có:**
- 📖 Đọc đoạn văn
- 🗂️ Xem từ vựng của mình

## **Thêm Admin mới:**
Để thêm admin mới, sửa file `src/firebase/authService.ts`:
```typescript
const adminEmails = [
  'admin@engapp.com',
  'admin@gmail.com',
  'test@admin.com',
  'newadmin@example.com' // Thêm email mới ở đây
];
```

## **Lưu ý:**
- Quyền admin được kiểm tra real-time khi user đăng nhập
- Nếu user đã đăng nhập và bạn thay đổi danh sách admin, user cần đăng xuất và đăng nhập lại
- Tất cả chức năng admin đều có conditional rendering để bảo mật
