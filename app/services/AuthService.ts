import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  User,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';

export class AuthService {
  /**
   * Sign up a new user with email and password
   */
  static async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      }
      
      console.log('✅ User signed up successfully:', userCredential.user.email);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in an existing user with email and password
   */
  static async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ User signed in successfully:', userCredential.user.email);
      return userCredential.user;
    } catch (error: any) {
      console.error('❌ Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<void> {
    try {
      await signOut(auth);
      console.log('✅ User signed out successfully');
    } catch (error: any) {
      console.error('❌ Sign out error:', error);
      throw new Error('Failed to sign out. Please try again.');
    }
  }

  /**
   * Send password reset email
   */
  static async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);
      console.log('✅ Password reset email sent to:', email);
    } catch (error: any) {
      console.error('❌ Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get the current user
   */
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Handle Firebase auth errors and return user-friendly messages
   */
  private static handleAuthError(error: any): Error {
    let message = 'An error occurred. Please try again.';

    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered. Please sign in instead.';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address.';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password sign in is not enabled. Please contact support.';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak. Please use at least 6 characters.';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled. Please contact support.';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email. Please sign up first.';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password. Please try again.';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid email or password. Please check and try again.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your internet connection.';
        break;
      default:
        message = error.message || 'An error occurred. Please try again.';
    }

    return new Error(message);
  }
}
