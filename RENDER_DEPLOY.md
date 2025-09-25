# 🚀 Deploy Budgo lên Render.com

## Bước 1: Chuẩn bị
1. Đăng ký tài khoản tại [render.com](https://render.com)
2. Đảm bảo code đã push lên GitHub

## Bước 2: Tạo Web Service
1. Vào [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect với GitHub repo của bạn
4. Chọn repo `budgo`

## Bước 3: Cấu hình
- **Name**: `budgo`
- **Environment**: `Node`
- **Branch**: `main` (hoặc `master`)
- **Root Directory**: để trống
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

## Bước 4: Environment Variables
Thêm các biến môi trường sau:

### Firebase Client Config
```
NEXT_PUBLIC_FIREBASE_API_KEY = AIzaSyAxRxqld2Stq9vfnEFSWSOY6FVAMVSo9sg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = budgo-aae32.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID = budgo-aae32
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = budgo-aae32.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 425510616763
NEXT_PUBLIC_FIREBASE_APP_ID = 1:425510616763:web:d6ec3ec732ee67014f739e
```

### Firebase Admin Config
```
FIREBASE_CLIENT_EMAIL = firebase-adminsdk-fbsvc@budgo-aae32.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY = -----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCTfDO3a63fo87W\nJeGtE+WTx0cG75u0ezJk7kfI6HWBetUXwvhxcLfd5aDGELa2pnBlB1jV3G3o9EGd\nvYZ9AkqWxxZqGKp0DFKCAU44AJf+pmnO7GyhO7D7Z9ibQWe4YD8GwZXgz5qRGudZ\nWi+tHwj1UyOtlgNJ9NOhoaLnCc8Qobzcz5YhpOC3Y8mpbZ0pInt7ZSKFG49NOQtj\nQM8Rx5hBFvFy6+VAfy9n+U8oKjtjJepl9qczrm9xiVE9sx55OkYJ87HI5L85ICjl\nPwLiLYENxN+9tbMKHPxiLMUkoFuwiPU3I4ug2zSOsHvYuUSWOQGeblqTxhcriMQJ\nLHgY6D/5AgMBAAECggEAI0/0JAEcrvTOI7kLOUEP0Vu/1lnNap+qt77TojeCVv+d\ngOR2TtcBtxfxcCr1THM6av4g14fBKys8gLOtvUWsrUA6zilcuo9uu+DrJP6DZf3b\nTKeP9OTRYciB9N5qopssyAXSyHJ8nCyYYuz0iFtrbi27V6cY337GoycL1YykLuNl\nlCh7a6iv9cDlitFMYAWOrR8H78bL2FIcSYOGLdkZXPMznN4bDymn86VGJKKzTr7u\nCRqPJ0cVcFLRZsvKCUVuq6H0hYkTjxuNgUMfcu3PczGoiIJbsd+RMw9eghyUZ4ZM\nbA46f3rxd6tkYVsKfc20deBIa0FqAkKg/o3404AotwKBgQDPBtK0wdZ9TMd+HgK+\njXxKxw35wIwuwvw0JMjsuEp+xmV6/QtTdwIkr+KerJQN1WiXmvOOOJ3tmPTjHvL3\nXG/4AeA8o62uMC/zzmFKxAQ+vmuUVjG9ZAwaakLCw6w5weXg7+Ww9hFl1kFu/R9+\nh+DPo28msxCDJk4gOkil8REs1wKBgQC2X6Ys4ke52htKfzmUgpuAQFlDTGZFRK5l\nhXS/povFYpIx4Yy/FpZq1Nj3eApvvA1/KwepRav0/ugcryGikms1ShlYOltwNgnB\nECq4c5BNxVeWAhTYjEKbuValmR13GcT5PUEwiynaKcw/Eevaz4nT92lwM0OCt0rJ\nghTdTIYPrwKBgQCPMbb4E8LZ9AtgLj3Ts2UvC7Oc9hOAHJn5LyBSq73LJkr24KO+\n3Wf8HDPxcIkPcHbhtemUi5Cg0NVBaxy+/47qydFh4Ay3mNjyF+OvpRkSlP8wINZS\nmyrL8oeu000CvhzUktoapniuKZ4kuKvaBv32YKL275ASRqJvJCEvtigdDQKBgGZO\n4C0bv7sOFPNEzet3HX7kGm87g7/mGKORK358ErrnYjYjXs6wAC/sOc8SA2DNMREe\n9YxUKEQnX9T/ljHaS9Q4PmGVU0huuCgbRqv1AIXwaAMaJdGZVaCAZ5A8hiATT8G2\nUETIPPFLM25KQnKcrKhBil/MElpZMtY6aDQBQs+3AoGBAML6A0DaxdqIMnRMmujv\noT6SCcEY3h0Tm9lhENnEz32X6ifNcDJ2UJanAcagaIkJTj7LRj8YDZk84qIX0qGp\nnakl9v5Mh68JSUy/aAhSyJtJcYvsD4roYmQ7OSUCNoKqADY41rKA6qC7QwRlfRmP\nO4He5EHRskRFbzigAzFbVI0q\n-----END PRIVATE KEY-----\n
```

### Other
```
NODE_ENV = production
```

## Bước 5: Deploy
1. Click **"Create Web Service"**
2. Render sẽ tự động build và deploy
3. Chờ khoảng 5-10 phút để build xong
4. Truy cập URL được tạo ra

## Bước 6: Test
- Kiểm tra trang chủ
- Test đăng nhập Google
- Test tạo nhóm
- Test tạo chuyến đi

## Troubleshooting
- Nếu build fail, check logs trong Render dashboard
- Nếu Firebase lỗi, kiểm tra environment variables
- Nếu 404, kiểm tra start command

## URL sau khi deploy
App sẽ có URL dạng: `https://budgo-xxxxx.onrender.com`
