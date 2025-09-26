# Firebase Auth Setup Guide

## Vấn đề: Google OAuth không hoạt động trên production

### 1. Firebase Console Configuration

#### A. Authorized Domains
1. Vào Firebase Console → Authentication → Settings → Authorized domains
2. Thêm các domain sau:
   - `localhost` (cho development)
   - `your-render-app.onrender.com` (cho production)
   - `budgo-aae32.firebaseapp.com` (Firebase hosting domain)

#### B. Google OAuth Provider
1. Vào Firebase Console → Authentication → Sign-in method
2. Enable Google provider
3. Cấu hình:
   - **Web SDK configuration**: Copy client ID và secret
   - **Authorized redirect URIs**: 
     - `http://localhost:3000` (development)
     - `https://your-render-app.onrender.com` (production)
     - `https://budgo-aae32.firebaseapp.com` (Firebase hosting)

### 2. Google Cloud Console Configuration

#### A. OAuth 2.0 Client IDs
1. Vào Google Cloud Console → APIs & Services → Credentials
2. Tìm OAuth 2.0 Client ID cho Firebase project
3. Thêm Authorized redirect URIs:
   - `https://budgo-aae32.firebaseapp.com/__/auth/handler`
   - `https://your-render-app.onrender.com/__/auth/handler`

#### B. OAuth Consent Screen
1. Vào OAuth consent screen
2. Đảm bảo app status là "In production" hoặc "Testing"
3. Thêm test users nếu cần

### 3. Environment Variables

Đảm bảo các biến môi trường được set đúng trên Render.com:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=budgo-aae32.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=budgo-aae32
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=budgo-aae32.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Debug Steps

1. **Check browser console** for Firebase Auth errors
2. **Check Render.com logs** for server-side errors
3. **Verify domain configuration** in Firebase Console
4. **Test with AuthDebug component** (development only)

### 5. Common Issues

#### Issue: `auth/unauthorized-domain`
**Solution**: Add domain to Firebase Console → Authentication → Settings → Authorized domains

#### Issue: `auth/operation-not-allowed`
**Solution**: Enable Google provider in Firebase Console → Authentication → Sign-in method

#### Issue: Popup blocked
**Solution**: Use redirect flow instead of popup, or ensure popup is not blocked

#### Issue: CORS errors
**Solution**: Check Firebase project configuration and domain settings

### 6. Testing

1. **Local development**: Should work with `localhost`
2. **Production**: Test with actual domain
3. **Firebase Hosting**: Test with Firebase domain

### 7. Alternative Solutions

Nếu Google OAuth vẫn không hoạt động:

1. **Use Firebase Hosting** instead of Render.com
2. **Use different OAuth provider** (GitHub, Facebook)
3. **Implement custom auth** with email/password
4. **Use Firebase Auth with custom domain**

## Quick Fix Commands

```bash
# Check Firebase project
firebase projects:list

# Check current project
firebase use

# Deploy to Firebase Hosting (alternative)
firebase deploy --only hosting
```
