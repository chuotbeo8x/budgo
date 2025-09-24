# Firebase Admin SDK Setup

## Cách 1: Sử dụng Service Account Key File (Khuyến nghị)

1. **Tải Service Account Key:**
   - Vào Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Tải file JSON về máy

2. **Đặt file key vào project:**
   - Đặt file JSON vào thư mục `src/lib/` với tên `firebase-service-account.json`
   - **Lưu ý:** Thêm file này vào `.gitignore` để không commit lên Git

3. **Cập nhật code:**
   ```typescript
   // src/lib/firebase-admin.ts
   import { initializeApp, getApps, cert } from 'firebase-admin/app';
   import { getFirestore } from 'firebase-admin/firestore';
   import serviceAccount from './firebase-service-account.json';

   const adminApp = getApps().length === 0 ? initializeApp({
     credential: cert(serviceAccount as any),
   }) : getApps()[0];

   export const adminDb = getFirestore(adminApp);
   ```

## Cách 2: Sử dụng Environment Variables

1. **Thêm vào .env.local:**
   ```bash
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   ```

2. **Lưu ý:** Private key phải có dấu ngoặc kép và `\n` thay vì xuống dòng thật

## Cách 3: Sử dụng Default Credentials

1. **Set environment variable:**
   ```bash
   set GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account-key.json
   ```

2. **Code đơn giản:**
   ```typescript
   // src/lib/firebase-admin.ts
   import { initializeApp, getApps } from 'firebase-admin/app';
   import { getFirestore } from 'firebase-admin/firestore';

   const adminApp = getApps().length === 0 ? initializeApp() : getApps()[0];
   export const adminDb = getFirestore(adminApp);
   ```

## Troubleshooting

- **Lỗi "@opentelemetry/api":** Đã cài đặt các dependencies cần thiết
- **Lỗi "Cannot find module":** Kiểm tra đường dẫn file service account
- **Lỗi "Permission denied":** Kiểm tra Firestore Security Rules đã deploy chưa

## Test

Sau khi setup xong, thử tạo nhóm mới để kiểm tra xem có còn lỗi không.







