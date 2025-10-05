# 🧪 Hướng dẫn Test Admin Panel

## **Bước 1: Kiểm tra trang chủ**
1. Mở `http://localhost:3000`
2. **Chưa đăng nhập:** Chỉ thấy nút "🔐 Đăng nhập"
3. **Đã đăng nhập (user thường):** Thấy nút "🗂️ Từ vựng của tôi" + thông tin user
4. **Đã đăng nhập (admin):** Thấy cả nút "🗂️ Từ vựng của tôi" và "🛠️ Admin Panel"

## **Bước 2: Test với User thường**
1. Đăng nhập với email không phải admin (ví dụ: `user@example.com`)
2. **Trang chủ:** Không thấy nút "Admin Panel"
3. **Thử truy cập trực tiếp:** Gõ `http://localhost:3000/admin` vào URL
4. **Kết quả mong đợi:** Hiển thị trang "🚫 Không có quyền truy cập"

## **Bước 3: Test với Admin**
1. Đăng nhập với email admin:
   - `admin@engapp.com`
   - `admin@gmail.com` 
   - `test@admin.com`
2. **Trang chủ:** Thấy nút "🛠️ Admin Panel"
3. **Click nút Admin Panel:** Chuyển đến trang admin với:
   - Header "🛠️ Admin Panel"
   - Nút "← Quay về trang chủ"
   - Nút "📚 Quản lý chủ đề"
   - Nội dung AdminQuestionsPage

## **Bước 4: Test Navigation**
1. **Từ Admin Panel:**
   - Click "← Quay về trang chủ" → Về trang chủ
   - Click "📚 Quản lý chủ đề" → Đến trang chủ đề
2. **Từ trang chủ đề:**
   - Admin sẽ thấy nút "Tạo đoạn văn mới"
   - Admin sẽ thấy nút "✏️ Sửa" và "🗑️ Xóa" trên mỗi card
   - User thường chỉ thấy nút "📖 Đọc"

## **Bước 5: Test bảo mật**
1. **User thường truy cập trực tiếp:**
   - `localhost:3000/admin` → Trang lỗi "Không có quyền"
   - `localhost:3000/topics` → Không thấy nút tạo/sửa/xóa
2. **Admin truy cập:**
   - `localhost:3000/admin` → Trang admin bình thường
   - `localhost:3000/topics` → Thấy đầy đủ nút CRUD

## **Troubleshooting:**

### **Nếu Admin Panel không hiển thị:**
1. Kiểm tra email có trong danh sách admin không
2. Đăng xuất và đăng nhập lại
3. Kiểm tra console (F12) có lỗi không

### **Nếu không thể vào Admin Panel:**
1. Đảm bảo đã đăng nhập với email admin
2. Kiểm tra URL có đúng `/admin` không
3. Hard refresh (Ctrl + F5)

### **Nếu thấy lỗi:**
1. Mở Developer Tools (F12)
2. Kiểm tra Console tab
3. Kiểm tra Network tab
4. Screenshot lỗi và báo cáo

## **Danh sách Email Admin:**
```
admin@engapp.com
admin@gmail.com
test@admin.com
```

## **Expected Results:**
- ✅ Admin thấy nút Admin Panel
- ✅ User thường không thấy nút Admin Panel  
- ✅ Admin có thể vào trang admin
- ✅ User thường bị chặn khi truy cập trực tiếp
- ✅ Navigation hoạt động mượt mà
- ✅ Phân quyền đúng ở mọi trang
