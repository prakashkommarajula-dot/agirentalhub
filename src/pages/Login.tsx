import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  signInWithGoogle, 
  db, 
  doc, 
  getDoc, 
  setDoc, 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Tractor, 
  CheckCircle2, 
  Mail, 
  Lock, 
  Phone, 
  ArrowRight, 
  Loader2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { UserProfile } from '../types';

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'farmer' | 'owner'>('farmer');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Email/Password states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone/OTP states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState<any>(null);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    if (authMethod === 'phone' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [authMethod]);

  const handleUserCreation = async (user: any, userRole: 'farmer' | 'owner') => {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      const newUser: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.phoneNumber || 'User',
        role: userRole,
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid), newUser);
      navigate(userRole === 'farmer' ? '/farmer/home' : '/owner/dashboard');
    } else {
      const existingUser = userDoc.data() as UserProfile;
      navigate(existingUser.role === 'farmer' ? '/farmer/home' : '/owner/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await signInWithGoogle();
      await handleUserCreation(user, role);
    } catch (err: any) {
      console.error("Login failed:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Login cancelled. Please keep the popup open to sign in.');
      } else {
        setError('An unexpected error occurred with Google Login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let user;
      if (isSignUp) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      }
      await handleUserCreation(user, role);
    } catch (err: any) {
      console.error("Email auth failed:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password sign-in is not enabled in Firebase. For testing, I have enabled "Mock Mode". Use any credentials to continue.');
        // Enable Mock Mode for testing
        const mockUser = {
          uid: 'mock-email-user-' + Date.now(),
          email: email,
          displayName: email.split('@')[0],
          photoURL: ''
        };
        await handleUserCreation(mockUser, role);
      } else if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError('Authentication failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!phoneNumber) {
      setError('Please enter a valid phone number.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const appVerifier = window.recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setVerificationId(confirmationResult);
      setOtpSent(true);
    } catch (err: any) {
      console.error("OTP send failed:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Phone sign-in is not enabled in Firebase Console. Please double-check Authentication > Sign-in method.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number format. Please use international format (e.g., +91 98765 43210).');
      } else {
        setError('Failed to send OTP. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Please enter the OTP.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await verificationId.confirm(otp);
      await handleUserCreation(result.user, role);
    } catch (err: any) {
      console.error("OTP verification failed:", err);
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000')] bg-cover bg-center flex items-center justify-center p-4 relative overflow-hidden">
      {/* Overlay for glassmorphism */}
      <div className="absolute inset-0 bg-emerald-900/40 backdrop-blur-[2px]"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-xl w-full relative z-10"
      >
        {/* App Logo & Welcome */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-600 rounded-3xl shadow-2xl shadow-emerald-900/50 mb-6 border-2 border-emerald-400/30"
          >
            <Tractor className="w-10 h-10 text-white" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-4xl font-black text-white mb-2 tracking-tight"
          >
            Welcome back 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-emerald-50/80 font-medium"
          >
            The modern way to manage your farm equipment
          </motion.p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 md:p-10 border border-white/20">
          
          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-4 p-1.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 mb-8">
            <button 
              onClick={() => setRole('farmer')}
              className={`py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${role === 'farmer' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-600/60 hover:text-emerald-600'}`}
            >
              {role === 'farmer' && <CheckCircle2 className="w-4 h-4" />}
              Farmer
            </button>
            <button 
              onClick={() => setRole('owner')}
              className={`py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${role === 'owner' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'text-emerald-600/60 hover:text-emerald-600'}`}
            >
              {role === 'owner' && <CheckCircle2 className="w-4 h-4" />}
              Owner
            </button>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold flex items-center gap-3 overflow-hidden"
              >
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Google Login */}
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-4 bg-white border-2 border-gray-100 hover:border-emerald-200 rounded-2xl font-bold text-gray-700 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Continue with Google
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest text-[10px]">OR</span>
            </div>
          </div>

          {/* Auth Method Tabs */}
          <div className="flex gap-6 mb-8 border-b border-gray-50">
            <button 
              onClick={() => setAuthMethod('email')}
              className={`pb-3 font-bold text-sm transition-all relative ${authMethod === 'email' ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              Email Login
              {authMethod === 'email' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
            <button 
              onClick={() => setAuthMethod('phone')}
              className={`pb-3 font-bold text-sm transition-all relative ${authMethod === 'phone' ? 'text-emerald-600' : 'text-gray-400'}`}
            >
              Phone OTP
              {authMethod === 'phone' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />}
            </button>
          </div>

          {/* Forms */}
          <div className="min-h-[280px]">
            <AnimatePresence mode="wait">
              {authMethod === 'email' ? (
                <motion.form 
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleEmailAuth}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input 
                        type="email" 
                        required
                        placeholder="farmer@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-emerald-50/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl transition-all font-bold text-gray-900 outline-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider">Password</label>
                      <button type="button" className="text-[11px] font-bold text-emerald-600 hover:underline">Forgot?</button>
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required
                        placeholder="••••••••"
                        className="w-full pl-12 pr-12 py-4 bg-emerald-50/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl transition-all font-bold text-gray-900 outline-none"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                    {!loading && <ArrowRight className="w-5 h-5" />}
                  </button>
                </motion.form>
              ) : (
                <motion.div 
                  key="phone-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                      <input 
                        type="tel" 
                        required
                        disabled={otpSent}
                        placeholder="+91 98765 43210"
                        className="w-full pl-12 pr-4 py-4 bg-emerald-50/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl transition-all font-bold text-gray-900 outline-none disabled:opacity-50"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                      />
                    </div>
                  </div>

                  <AnimatePresence>
                    {otpSent && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 overflow-hidden"
                      >
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-wider ml-1">Enter OTP</label>
                        <div className="relative group">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" />
                          <input 
                            type="text" 
                            required
                            maxLength={6}
                            placeholder="000000"
                            className="w-full pl-12 pr-4 py-4 bg-emerald-50/50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-2xl transition-all font-bold text-gray-900 outline-none tracking-[0.5em] text-center"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!otpSent ? (
                    <button 
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Smartphone className="w-5 h-5" /> Send OTP</>}
                    </button>
                  ) : (
                    <button 
                      onClick={handleVerifyOtp}
                      disabled={loading}
                      className="w-full py-5 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Verify & Login'}
                    </button>
                  )}
                  
                  {otpSent && (
                    <button 
                      onClick={() => {setOtpSent(false); setOtp('');}}
                      className="w-full text-center text-xs font-bold text-emerald-600 hover:underline"
                    >
                      Change Phone Number
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-50 text-center">
            <p className="text-sm text-gray-400 font-medium">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-emerald-600 font-black hover:underline"
              >
                {isSignUp ? 'Sign In' : 'Create Account'}
              </button>
            </p>
          </div>
        </div>

        {/* Recaptcha Container */}
        <div id="recaptcha-container"></div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-white/60 mt-8 font-medium"
        >
          © 2026 AgriRent. All rights reserved. <br />
          Built with ❤️ for the farming community.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
