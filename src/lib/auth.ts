import { 
  signInWithRedirect, 
  getRedirectResult,
  signOut, 
  onAuthStateChanged, 
  User,
  UserCredential 
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    // Use redirect instead of popup to avoid popup blockers
    await signInWithRedirect(auth, googleProvider);
    // This will redirect the user, so we won't reach here
    throw new Error('Redirect initiated');
  } catch (error: any) {
    console.error('Error signing in with Google:', error);
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Quá nhiều yêu cầu. Vui lòng thử lại sau.');
    } else if (error.code === 'auth/operation-not-allowed') {
      throw new Error('Đăng nhập Google chưa được bật. Vui lòng liên hệ quản trị viên.');
    } else if (error.code === 'auth/unauthorized-domain') {
      throw new Error('Domain không được phép. Vui lòng liên hệ quản trị viên.');
    } else if (error.message === 'Redirect initiated') {
      // This is expected, don't show error
      throw error;
    } else {
      throw new Error('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    }
  }
};

export const handleGoogleRedirect = async (): Promise<UserCredential | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error: any) {
    console.error('Error handling Google redirect:', error);
    return null;
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