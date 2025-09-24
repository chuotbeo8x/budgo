# Q&A Tracker

Ứng dụng quản lý nhóm, chuyến đi và chia sẻ chi phí một cách minh bạch và dễ dàng.

## Tính năng chính

- **Quản lý nhóm**: Tạo nhóm Public, Close hoặc Secret
- **Quản lý chuyến đi**: Tạo chuyến đi cá nhân hoặc thuộc nhóm
- **Chia sẻ chi phí**: Ghi nhận chi phí và chia sẻ minh bạch giữa các thành viên
- **Tạm ứng & quyết toán**: Quản lý tạm ứng và tính toán công nợ tự động
- **Xuất báo cáo**: Xuất báo cáo CSV/PDF chi tiết

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Firebase (Auth + Firestore)
- **Deploy**: Vercel

## Cài đặt

### 1. Clone repository

```bash
git clone <repository-url>
cd qa-tracker
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình Firebase

1. Tạo project Firebase tại [Firebase Console](https://console.firebase.google.com/)
2. Bật Authentication với Google Sign-in
3. Tạo Firestore database
4. Copy file `env.example` thành `.env.local`:

```bash
cp env.example .env.local
```

5. Điền thông tin Firebase vào `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Chạy ứng dụng

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

### 5. Test ứng dụng

Truy cập [http://localhost:3000/test](http://localhost:3000/test) để kiểm tra trạng thái ứng dụng và các tính năng đã hoàn thành.

### 6. Trợ giúp

Nếu gặp vấn đề, truy cập [http://localhost:3000/help](http://localhost:3000/help) để xem hướng dẫn và giải đáp các vấn đề thường gặp.

## Cấu trúc dự án

```
src/
├── app/                    # Next.js App Router
│   ├── login/             # Trang đăng nhập
│   ├── onboarding/        # Trang tạo tài khoản
│   ├── dashboard/         # Trang chính
│   └── layout.tsx         # Layout chính
├── components/            # React components
│   ├── auth/             # Auth components
│   └── ui/               # UI components (shadcn/ui)
├── lib/                  # Utilities
│   ├── firebase.ts       # Firebase config
│   └── auth.ts           # Auth functions
└── types/                # TypeScript types
```

## Roadmap

### MVP (4-6 tuần) ✅
- [x] Google Sign-in
- [x] Tạo tài khoản với username slug
- [x] Tạo nhóm (Public/Close/Secret)
- [x] Tham gia nhóm
- [ ] Tạo chuyến đi
- [ ] Quản lý thành viên
- [ ] Ghi nhận chi phí
- [ ] Tạm ứng & quyết toán
- [ ] Xuất báo cáo

### Post-MVP
- [ ] Notification system
- [ ] Audit logs
- [ ] Mobile app
- [ ] Premium features

## Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.
