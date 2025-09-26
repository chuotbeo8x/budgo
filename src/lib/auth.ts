import { 
  signInWithPopup,
  signOut, 
  onAuthStateChanged, 
  User,
  UserCredential 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    console.log('signInWithGoogle: Starting Google sign in...');
    const result = await signInWithPopup(auth, googleProvider);
    console.log('signInWithGoogle: Success!', result.user.uid);
    return result;
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Đăng nhập bị hủy. Vui lòng thử lại.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Đăng nhập bị hủy. Vui lòng thử lại.');
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