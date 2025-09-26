import { 
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User,
  UserCredential 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

// Check if running in development
const isDevelopment = process.env.NODE_ENV === 'development' || 
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

export const signInWithGoogle = async (): Promise<UserCredential | void> => {
  try {
    if (isDevelopment) {
      // Development: Use popup
      console.log('signInWithGoogle: Starting Google popup (dev mode)...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('signInWithGoogle: Popup success!', result.user.uid);
      return result;
    } else {
      // Production: Use redirect
      console.log('signInWithGoogle: Starting Google redirect (prod mode)...');
      await signInWithRedirect(auth, googleProvider);
      console.log('signInWithGoogle: Redirect initiated');
    }
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Đăng nhập bị hủy. Vui lòng thử lại.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      // Don't show error for cancelled popup - just ignore
      console.log('signInWithGoogle: Popup request cancelled, ignoring...');
      return;
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Đăng nhập Google chưa được bật. Vui lòng liên hệ quản trị viên.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Domain không được phép. Vui lòng liên hệ quản trị viên.');
    } else {
      throw new Error('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    }
  }
};

export const handleGoogleRedirect = async (): Promise<UserCredential | null> => {
  try {
    console.log('handleGoogleRedirect: Checking for redirect result...');
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('handleGoogleRedirect: Success!', result.user.uid);
    }
    return result;
  } catch (error: any) {
    console.error('Error handling Google redirect:', error);
    throw error;
  }
};


export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export { auth };