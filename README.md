# Budgo - Quản lý nhóm và chuyến đi

Ứng dụng web quản lý nhóm, chuyến đi và chia sẻ chi phí một cách minh bạch và dễ dàng. Được xây dựng với Next.js 15, TypeScript và Firebase.

## 🚀 Tính năng chính

### 👥 Quản lý nhóm
- **Tạo nhóm**: Public, Close hoặc Secret
- **Quản lý thành viên**: Thêm/xóa thành viên, phân quyền Owner/Member
- **Yêu cầu tham gia**: Duyệt yêu cầu tham gia cho nhóm Close
- **Slug duy nhất**: Mỗi nhóm có slug riêng để truy cập dễ dàng

### 🗺️ Quản lý chuyến đi
- **Chuyến đi cá nhân**: Tạo chuyến đi riêng tư
- **Chuyến đi nhóm**: Tạo chuyến đi thuộc về nhóm
- **Thông tin chi tiết**: Tên, mô tả, ngày bắt đầu/kết thúc, địa điểm
- **Đa tiền tệ**: Hỗ trợ VND và USD
- **Trạng thái**: Active/Closed với khả năng khóa chuyến đi

### 💰 Chia sẻ chi phí
- **Ghi nhận chi phí**: Thêm chi phí với mô tả, danh mục, người trả
- **Phương thức chia**: Chia đều hoặc theo trọng số
- **Loại trừ thành viên**: Có thể loại trừ một số thành viên khỏi chi phí
- **Tạm ứng**: Quản lý tạm ứng của các thành viên
- **Quyết toán tự động**: Tính toán công nợ và đề xuất hoàn trả

### 📊 Báo cáo và xuất dữ liệu
- **Tóm tắt tài chính**: Tổng chi phí, tạm ứng, công nợ
- **Xuất CSV/PDF**: Báo cáo chi tiết cho từng chuyến đi
- **Lịch sử giao dịch**: Theo dõi tất cả chi phí và tạm ứng

### 🔔 Thông báo
- **Thông báo trong ứng dụng**: Toast notifications và badge
- **Các loại thông báo**: Yêu cầu tham gia nhóm, mời chuyến đi, thêm chi phí, đóng chuyến đi
- **Trạng thái đọc**: Đánh dấu đã đọc/chưa đọc

### 👤 Quản lý người dùng
- **Đăng nhập Google**: Xác thực nhanh và an toàn
- **Hồ sơ cá nhân**: Tên, avatar, username, ngày sinh
- **Danh hiệu**: Hệ thống vote danh hiệu cho thành viên
- **Cài đặt**: Ngôn ngữ, đơn vị tiền tệ mặc định

### 🛡️ Bảo mật và quyền
- **RBAC**: Phân quyền Owner/Member cho nhóm và chuyến đi
- **Firestore Rules**: Kiểm soát truy cập dữ liệu
- **Audit logs**: Ghi lại các thao tác quan trọng

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: App Router, Server Components, Server Actions
- **TypeScript**: Type safety và developer experience
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Component library với Radix UI
- **Lucide React**: Icon library

### Backend & Database
- **Firebase Auth**: Xác thực người dùng với Google OAuth
- **Firestore**: NoSQL database cho dữ liệu thời gian thực
- **Firebase Admin SDK**: Server-side operations

### Development & Deployment
- **Vercel**: Hosting và CI/CD
- **GitHub**: Version control
- **ESLint**: Code linting
- **Turbopack**: Fast bundling

## 📁 Cấu trúc dự án

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth-related pages
│   │   ├── login/               # Đăng nhập
│   │   └── onboarding/          # Tạo tài khoản
│   ├── dashboard/               # Trang chính
│   ├── groups/                  # Quản lý nhóm
│   │   ├── create/             # Tạo nhóm
│   │   └── manage/             # Quản lý nhóm
│   ├── trips/                   # Quản lý chuyến đi
│   │   ├── create/             # Tạo chuyến đi
│   │   ├── manage/             # Quản lý chuyến đi
│   │   └── [slug]/             # Chi tiết chuyến đi
│   ├── profiles/               # Hồ sơ người dùng
│   ├── admin/                   # Khu vực quản trị
│   ├── notifications/           # Thông báo
│   └── api/                     # API routes
├── components/                   # React components
│   ├── auth/                   # Authentication components
│   ├── ui/                     # UI components (shadcn/ui)
│   ├── ExpensesPage.tsx        # Trang chi phí
│   ├── TripCreateForm.tsx      # Form tạo chuyến đi
│   └── Header.tsx              # Header component
├── lib/                        # Utilities và logic
│   ├── actions/                # Server actions
│   ├── utils/                  # Utility functions
│   ├── types.ts               # TypeScript types
│   ├── firebase.ts            # Firebase config
│   └── auth.ts                # Auth functions
└── hooks/                      # Custom React hooks
```

## 🚀 Cài đặt và chạy

### 1. Clone repository

```bash
git clone https://github.com/chuotbeo8x/budgo.git
cd budgo
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Firebase

1. Tạo project Firebase tại [Firebase Console](https://console.firebase.google.com/)
2. Bật Authentication với Google Sign-in
3. Tạo Firestore database
4. Tạo Service Account và download key JSON
5. Copy file `env.example` thành `.env.local`:

```bash
cp env.example .env.local
```

6. Điền thông tin Firebase vào `.env.local`:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin SDK
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----"
```

### 4. Cấu hình Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Groups: owner can read/write, members can read
    match /groups/{groupId} {
      allow read: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.memberIds);
      allow write: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
    
    // Trips: owner and members can read, owner can write
    match /trips/{tripId} {
      allow read: if request.auth != null && 
        (resource.data.ownerId == request.auth.uid || 
         request.auth.uid in resource.data.memberIds);
      allow write: if request.auth != null && 
        resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### 5. Chạy ứng dụng

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  googleUid: string;
  name: string;
  email: string;
  avatar: string;
  username: string;
  birthday?: Date;
  createdAt: Date;
}
```

### Group
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'close' | 'secret';
  ownerId: string;
  slug: string;
  memberIds: string[];
  createdAt: Date;
}
```

### Trip
```typescript
interface Trip {
  id: string;
  name: string;
  description?: string;
  currency: 'VND' | 'USD';
  ownerId: string;
  groupId?: string;
  status: 'active' | 'closed';
  slug: string;
  startDate?: Date;
  endDate?: Date;
  destination?: string;
  statsCache: {
    totalAdvance: number;
    totalExpense: number;
    computedAt: Date;
  };
}
```

### Expense
```typescript
interface Expense {
  id: string;
  tripId: string;
  amount: number;
  paidBy: string;
  splitMethod: 'equal' | 'weight';
  weightMap?: WeightEntry[];
  exclusions?: string[];
  category?: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
}
```

## 🔧 Scripts

```bash
# Development
npm run dev                 # Chạy development server
npm run build             # Build production
npm run start             # Chạy production server

# Beta deployment
npm run build:beta        # Build cho beta environment
npm run deploy:beta       # Deploy lên Firebase Hosting

# Code quality
npm run lint              # ESLint checking
```

## 🌐 Deployment

### Vercel (Recommended)
1. Connect GitHub repository với Vercel
2. Cấu hình environment variables
3. Deploy tự động từ main branch

### Firebase Hosting
```bash
npm run build:beta
npm run deploy:beta
```

## 🧪 Testing

Truy cập [http://localhost:3000/help](http://localhost:3000/help) để xem hướng dẫn và giải đáp các vấn đề thường gặp.

## 📈 Roadmap

### ✅ MVP (Hoàn thành)
- [x] Google Sign-in
- [x] Tạo tài khoản với username slug
- [x] Tạo nhóm (Public/Close/Secret)
- [x] Tham gia nhóm
- [x] Tạo chuyến đi cá nhân/nhóm
- [x] Quản lý thành viên chuyến đi
- [x] Ghi nhận chi phí và tạm ứng
- [x] Quyết toán tự động
- [x] Xuất báo cáo CSV/PDF
- [x] Hệ thống thông báo
- [x] Admin panel

### 🚧 Post-MVP
- [ ] Mobile app (React Native)
- [ ] Real-time collaboration
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Premium features
- [ ] API for third-party integrations

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Hỗ trợ

- **Documentation**: [http://localhost:3000/help](http://localhost:3000/help)
- **Issues**: [GitHub Issues](https://github.com/chuotbeo8x/budgo/issues)
- **Email**: [Your contact email]

---

**Budgo** - Quản lý nhóm và chuyến đi một cách thông minh! 🚀