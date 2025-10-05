# 🔧 Development Mode - Hướng dẫn

## **Trạng thái hiện tại:**
Ứng dụng đang chạy ở **Development Mode** với các đặc điểm:

### **✅ Đã tắt:**
- ❌ Yêu cầu đăng nhập cho Admin Panel
- ❌ Kiểm tra quyền admin
- ❌ Phân quyền user/admin

### **✅ Đã bật:**
- ✅ Nút "🛠️ Admin Panel" luôn hiển thị
- ✅ Tất cả nút CRUD luôn hiển thị
- ✅ Có thể truy cập `/admin` mà không cần đăng nhập
- ✅ Thông báo "🔧 Development Mode - Auth disabled"

## **Cách sử dụng:**

### **1. Truy cập Admin Panel:**
- Mở `http://localhost:3000`
- Click "🛠️ Admin Panel" (luôn hiển thị)
- Hoặc truy cập trực tiếp: `http://localhost:3000/admin`

### **2. Quản lý nội dung:**
- Vào trang chủ đề: `http://localhost:3000/topics`
- Thấy nút "Tạo đoạn văn mới" ở header
- Thấy nút "✏️ Sửa" và "🗑️ Xóa" trên mỗi card
- Có thể thêm/sửa/xóa đoạn văn mà không cần đăng nhập

### **3. Test các chức năng:**
- ✅ Tạo đoạn văn mới
- ✅ Sửa đoạn văn
- ✅ Xóa đoạn văn
- ✅ Quản lý câu hỏi
- ✅ Quản lý từ vựng

## **Khi nào bật lại Auth:**

### **Trước khi deploy production:**

**1. Sửa `src/pages/AdminPage.tsx`:**
```typescript
// Thay thế:
// Trong giai đoạn phát triển, cho phép truy cập admin mà không cần đăng nhập

// Bằng:
if (!user) {
  navigate('/');
  return null;
}

if (!isAdmin) {
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🚫 Không có quyền truy cập</h1>
          <p>Bạn cần quyền admin để truy cập trang này</p>
          <button 
            className="header-button" 
            onClick={() => navigate('/')}
          >
            ← Quay về trang chủ
          </button>
        </div>
      </header>
      <main className="main-content">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>🔐 Yêu cầu quyền Admin</h2>
          <p>Chỉ admin mới có thể truy cập trang quản trị này.</p>
          <p>Vui lòng đăng nhập với tài khoản admin.</p>
        </div>
      </main>
    </div>
  );
}
```

**2. Sửa `src/pages/HomePage.tsx`:**
```typescript
// Thay thế:
<button 
  className="button" 
  onClick={() => navigate('/admin')} 
  style={{ padding: '8px 14px', marginRight: '8px' }}
>
  🛠️ Admin Panel
</button>

// Bằng:
{isAdmin && (
  <button 
    className="button" 
    onClick={() => navigate('/admin')} 
    style={{ padding: '8px 14px', marginRight: '8px' }}
  >
    🛠️ Admin Panel
  </button>
)}
```

**3. Sửa `src/pages/PassageList.tsx`:**
```typescript
// Thay thế:
onCreatePassage={handleCreatePassage}
onEditPassage={handleEditPassage}
onDeletePassage={handleDeletePassage}

// Bằng:
onCreatePassage={isAdmin ? handleCreatePassage : undefined}
onEditPassage={isAdmin ? handleEditPassage : undefined}
onDeletePassage={isAdmin ? handleDeletePassage : undefined}
```

**4. Xóa dev notice:**
```typescript
// Xóa dòng này khỏi AdminPage:
<div className="dev-notice">
  🔧 Development Mode - Auth disabled
</div>
```

## **Lưu ý:**
- 🔧 Development Mode chỉ dành cho phát triển
- 🔒 Luôn bật lại auth trước khi deploy
- 📝 Danh sách admin email trong `src/firebase/authService.ts`
- 🧪 Test kỹ phân quyền sau khi bật auth

## **Danh sách Admin Email:**
```
admin@engapp.com
admin@gmail.com
test@admin.com
```
