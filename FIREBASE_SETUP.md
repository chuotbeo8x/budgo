# Hướng dẫn cài đặt Firebase cho Q&A Tracker

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" hoặc "Add project"
3. Nhập tên project (ví dụ: `qa-tracker-dev`)
4. Chọn "Enable Google Analytics" (tùy chọn)
5. Click "Create project"

## Bước 2: Cấu hình Authentication

1. Trong Firebase Console, chọn project vừa tạo
2. Vào **Authentication** > **Sign-in method**
3. Bật **Google** provider:
   - Click vào Google
   - Toggle "Enable"
   - Chọn Project support email
   - Click "Save"

## Bước 3: Tạo Firestore Database

1. Vào **Firestore Database**
2. Click "Create database"
3. Chọn "Start in test mode" (cho development)
4. Chọn location gần nhất (ví dụ: asia-southeast1)
5. Click "Done"

## Bước 4: Lấy Firebase Config

1. Vào **Project Settings** (biểu tượng bánh răng)
2. Scroll xuống phần "Your apps"
3. Click "Add app" > chọn Web (biểu tượng `</>`)
4. Nhập tên app (ví dụ: `qa-tracker-web`)
5. Click "Register app"
6. Copy config object:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

## Bước 5: Cấu hình Environment Variables

1. Copy file `env.example` thành `.env.local`:
```bash
cp env.example .env.local
```

2. Điền thông tin Firebase vào `.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Bước 6: Cấu hình Firestore Security Rules

1. Vào **Firestore Database** > **Rules**
2. Thay thế rules mặc định bằng:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users: mỗi user chỉ đọc/ghi hồ sơ của mình
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Groups
    match /groups/{groupId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }

    // Group Members
    match /groupMembers/{docId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }

    // Trips
    match /trips/{tripId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
    }

    // Trip Members
    match /tripMembers/{docId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }

    // Expenses
    match /expenses/{expenseId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.createdBy == request.auth.uid;
      allow update: if request.auth != null && resource.data.createdBy == request.auth.uid;
      allow delete: if request.auth != null;
    }

    // Advances
    match /advances/{advanceId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }

    // Settlements
    match /settlements/{settlementId} {
      allow read: if request.auth != null;
      allow create, update, delete: if request.auth != null;
    }

    // Audit Logs
    match /auditLogs/{logId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

3. Click "Publish"

## Bước 7: Test ứng dụng

1. Chạy ứng dụng:
```bash
npm run dev
```

2. Truy cập [http://localhost:3000](http://localhost:3000)

3. Test các tính năng:
   - Đăng nhập Google
   - Tạo tài khoản
   - Tạo nhóm
   - Xem dashboard

## Troubleshooting

### Lỗi "Firebase: Error (auth/unauthorized-domain)"
- Vào **Authentication** > **Settings** > **Authorized domains**
- Thêm `localhost` vào danh sách

### Lỗi "Missing or insufficient permissions"
- Kiểm tra Firestore Security Rules
- Đảm bảo user đã đăng nhập

### Lỗi "Firebase App named '[DEFAULT]' already exists"
- Restart development server
- Clear browser cache

## Cấu trúc Database

Sau khi test, bạn sẽ thấy các collection sau trong Firestore:

- `users` - Thông tin người dùng
- `groups` - Thông tin nhóm
- `groupMembers` - Thành viên nhóm
- `trips` - Chuyến đi (sắp có)
- `tripMembers` - Thành viên chuyến đi (sắp có)
- `expenses` - Chi phí (sắp có)
- `advances` - Tạm ứng (sắp có)
- `settlements` - Quyết toán (sắp có)
- `auditLogs` - Nhật ký (sắp có)


