import { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LogIn, ShoppingBasket, Mail } from 'lucide-react';
import { motion } from 'motion/react';

type View = 'signin' | 'signup' | 'reset';

function mapError(message: string): string {
  if (message.includes('Invalid login credentials'))
    return 'Incorrect email or password.';
  if (message.includes('User already registered'))
    return 'An account with this email already exists.';
  if (message.includes('Email not confirmed'))
    return 'Please confirm your email before signing in.';
  if (message.includes('Password should be at least'))
    return 'Password must be at least 8 characters.';
  return message;
}

export default function Login() {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword } =
    useAuth();

  const [view, setView] = useState<View>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  const clearForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
    setResetSent(false);
    setSignUpSuccess(false);
  };

  const switchView = (next: View) => {
    clearForm();
    setView(next);
  };

  const handleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    const { error } = await signInWithEmail(email, password);
    if (error) setError(mapError(error));
    setSubmitting(false);
  };

  const handleSignUp = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    const { error } = await signUpWithEmail(email, password);
    if (error) {
      setError(mapError(error));
    } else {
      setSignUpSuccess(true);
    }
    setSubmitting(false);
  };

  const handleReset = async () => {
    setError(null);
    setSubmitting(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(mapError(error));
    } else {
      setResetSent(true);
    }
    setSubmitting(false);
  };

  return (
    <div className='min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden'>
      {/* Decorative background elements */}
      <div className='absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30'>
        <div className='absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-200 blur-[120px]' />
        <div className='absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-100 blur-[100px]' />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='w-full max-w-md z-10'
      >
        <Card className='border-none shadow-2xl shadow-green-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl overflow-hidden'>
          <CardHeader className='text-center pt-10 pb-6'>
            <div className='mx-auto bg-green-600 h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/30 mb-6 rotate-3'>
              <ShoppingBasket className='h-8 w-8 text-white' />
            </div>
            <CardTitle className='text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-2'>
              Stay <span className='text-green-600'>Fresh</span>
            </CardTitle>
            <CardDescription className='text-zinc-500 font-medium text-lg'>
              Manage your kitchen like a pro.
            </CardDescription>
          </CardHeader>

          <CardContent className='space-y-5 pb-10 px-8'>
            {/* ── Sign In ── */}
            {view === 'signin' && (
              <>
                <div className='space-y-3'>
                  <div className='grid gap-1.5'>
                    <Label htmlFor='email'>Email</Label>
                    <Input
                      id='email'
                      type='email'
                      placeholder='you@example.com'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    />
                  </div>
                  <div className='grid gap-1.5'>
                    <div className='flex items-center justify-between'>
                      <Label htmlFor='password'>Password</Label>
                      <button
                        type='button'
                        className='text-xs text-zinc-500 hover:text-green-600 transition-colors cursor-pointer'
                        onClick={() => switchView('reset')}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input
                      id='password'
                      type='password'
                      placeholder='••••••••'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    />
                  </div>
                  {error && (
                    <p className='text-sm text-red-500 dark:text-red-400'>
                      {error}
                    </p>
                  )}
                  <Button
                    onClick={handleSignIn}
                    disabled={submitting}
                    className='w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/20 transition-all active:scale-95 cursor-pointer'
                  >
                    {submitting ? 'Signing in…' : 'Sign In'}
                  </Button>
                </div>

                <div className='flex items-center gap-3'>
                  <div className='flex-1 h-px bg-zinc-200 dark:bg-zinc-700' />
                  <span className='text-xs text-zinc-400'>or</span>
                  <div className='flex-1 h-px bg-zinc-200 dark:bg-zinc-700' />
                </div>

                <Button
                  onClick={signInWithGoogle}
                  className='hover:cursor-pointer w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3 transition-all active:scale-95'
                >
                  <LogIn className='h-4 w-4' />
                  Sign in with Google
                </Button>

                <p className='text-center text-sm text-zinc-500 dark:text-zinc-400'>
                  Don't have an account?{' '}
                  <button
                    type='button'
                    className='text-green-600 font-semibold hover:underline cursor-pointer'
                    onClick={() => switchView('signup')}
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}

            {/* ── Sign Up ── */}
            {view === 'signup' && (
              <>
                {signUpSuccess ? (
                  <div className='text-center space-y-4 py-4'>
                    <div className='mx-auto bg-green-100 dark:bg-green-900/30 h-14 w-14 rounded-2xl flex items-center justify-center'>
                      <Mail className='h-7 w-7 text-green-600' />
                    </div>
                    <div>
                      <p className='font-bold text-zinc-900 dark:text-zinc-50'>
                        Check your inbox
                      </p>
                      <p className='text-sm text-zinc-500 mt-1'>
                        We sent a confirmation link to{' '}
                        <span className='font-medium'>{email}</span>.
                      </p>
                    </div>
                    <button
                      type='button'
                      className='text-sm text-green-600 font-semibold hover:underline cursor-pointer'
                      onClick={() => switchView('signin')}
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <>
                    <div className='space-y-3'>
                      <div className='grid gap-1.5'>
                        <Label htmlFor='signup-email'>Email</Label>
                        <Input
                          id='signup-email'
                          type='email'
                          placeholder='you@example.com'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className='grid gap-1.5'>
                        <Label htmlFor='signup-password'>Password</Label>
                        <Input
                          id='signup-password'
                          type='password'
                          placeholder='Min. 8 characters'
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      <div className='grid gap-1.5'>
                        <Label htmlFor='signup-confirm'>Confirm Password</Label>
                        <Input
                          id='signup-confirm'
                          type='password'
                          placeholder='••••••••'
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSignUp()}
                        />
                      </div>
                      {error && (
                        <p className='text-sm text-red-500 dark:text-red-400'>
                          {error}
                        </p>
                      )}
                      <Button
                        onClick={handleSignUp}
                        disabled={submitting}
                        className='w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/20 transition-all active:scale-95 cursor-pointer'
                      >
                        {submitting ? 'Creating account…' : 'Create Account'}
                      </Button>
                    </div>

                    <div className='flex items-center gap-3'>
                      <div className='flex-1 h-px bg-zinc-200 dark:bg-zinc-700' />
                      <span className='text-xs text-zinc-400'>or</span>
                      <div className='flex-1 h-px bg-zinc-200 dark:bg-zinc-700' />
                    </div>

                    <Button
                      onClick={signInWithGoogle}
                      className='hover:cursor-pointer w-full h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3 transition-all active:scale-95'
                    >
                      <LogIn className='h-4 w-4' />
                      Sign up with Google
                    </Button>

                    <p className='text-center text-sm text-zinc-500 dark:text-zinc-400'>
                      Already have an account?{' '}
                      <button
                        type='button'
                        className='text-green-600 font-semibold hover:underline cursor-pointer'
                        onClick={() => switchView('signin')}
                      >
                        Sign in
                      </button>
                    </p>
                  </>
                )}
              </>
            )}

            {/* ── Password Reset ── */}
            {view === 'reset' && (
              <>
                {resetSent ? (
                  <div className='text-center space-y-4 py-4'>
                    <div className='mx-auto bg-green-100 dark:bg-green-900/30 h-14 w-14 rounded-2xl flex items-center justify-center'>
                      <Mail className='h-7 w-7 text-green-600' />
                    </div>
                    <div>
                      <p className='font-bold text-zinc-900 dark:text-zinc-50'>
                        Reset link sent
                      </p>
                      <p className='text-sm text-zinc-500 mt-1'>
                        Check your inbox at{' '}
                        <span className='font-medium'>{email}</span>.
                      </p>
                    </div>
                    <button
                      type='button'
                      className='text-sm text-green-600 font-semibold hover:underline cursor-pointer'
                      onClick={() => switchView('signin')}
                    >
                      Back to sign in
                    </button>
                  </div>
                ) : (
                  <>
                    <div className='space-y-1'>
                      <p className='font-semibold text-zinc-900 dark:text-zinc-50'>
                        Reset your password
                      </p>
                      <p className='text-sm text-zinc-500'>
                        Enter your email and we'll send you a reset link.
                      </p>
                    </div>
                    <div className='space-y-3'>
                      <div className='grid gap-1.5'>
                        <Label htmlFor='reset-email'>Email</Label>
                        <Input
                          id='reset-email'
                          type='email'
                          placeholder='you@example.com'
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleReset()}
                        />
                      </div>
                      {error && (
                        <p className='text-sm text-red-500 dark:text-red-400'>
                          {error}
                        </p>
                      )}
                      <Button
                        onClick={handleReset}
                        disabled={submitting}
                        className='w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold shadow-lg shadow-green-600/20 transition-all active:scale-95 cursor-pointer'
                      >
                        {submitting ? 'Sending…' : 'Send Reset Link'}
                      </Button>
                    </div>

                    <p className='text-center text-sm text-zinc-500 dark:text-zinc-400'>
                      <button
                        type='button'
                        className='text-green-600 font-semibold hover:underline cursor-pointer'
                        onClick={() => switchView('signin')}
                      >
                        Back to sign in
                      </button>
                    </p>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

//   return (
//     <div className='min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 relative overflow-hidden'>
//       {/* Decorative background elements */}
//       <div className='absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-30'>
//         <div className='absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-200 blur-[120px]' />
//         <div className='absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full bg-blue-100 blur-[100px]' />
//       </div>

//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className='w-full max-w-md z-10'
//       >
//         <Card className='border-none shadow-2xl shadow-green-900/5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-3xl overflow-hidden'>
//           <CardHeader className='text-center pt-10 pb-6'>
//             <div className='mx-auto bg-green-600 h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg shadow-green-600/30 mb-6 rotate-3'>
//               <ShoppingBasket className='h-8 w-8 text-white' />
//             </div>
//             <CardTitle className='text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-2'>
//               Stay <span className='text-green-600'>Fresh</span>
//             </CardTitle>
//             <CardDescription className='text-zinc-500 font-medium text-lg'>
//               Manage your kitchen like a pro.
//             </CardDescription>
//           </CardHeader>
//           <CardContent className='space-y-8 pb-10 px-8'>
//             <div className='space-y-4'>
//               <div className='flex items-center space-x-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-colors hover:bg-white dark:hover:bg-zinc-700 group'>
//                 <div className='bg-white dark:bg-zinc-700 p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform'>
//                   <Sparkles className='h-5 w-5 text-green-500' />
//                 </div>
//                 <div>
//                   <h4 className='font-bold text-zinc-900 dark:text-zinc-50 leading-tight'>
//                     Reduce waste
//                   </h4>
//                   <p className='text-xs text-zinc-500 dark:text-zinc-400'>
//                     Track expiry dates and eat fresh.
//                   </p>
//                 </div>
//               </div>
//               <div className='flex items-center space-x-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-colors hover:bg-white dark:hover:bg-zinc-700 group'>
//                 <div className='bg-white dark:bg-zinc-700 p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform'>
//                   <ShieldCheck className='h-5 w-5 text-blue-500' />
//                 </div>
//                 <div>
//                   <h4 className='font-bold text-zinc-900 dark:text-zinc-50 leading-tight'>
//                     Simple & Secure
//                   </h4>
//                   <p className='text-xs text-zinc-500 dark:text-zinc-400'>
//                     Sign in with your Google account.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <Button
//               onClick={signInWithGoogle}
//               className='hover:cursor-pointer w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3 transition-all active:scale-95'
//             >
//               <LogIn className='h-5 w-5' />
//               Sign in with Google
//             </Button>

//             <p className='text-center text-xs text-zinc-400 dark:text-zinc-500'>
//               By signing in, you agree to track your hunger level responsibly.
//             </p>
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// }
