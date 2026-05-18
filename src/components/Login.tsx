import { useAuth } from './AuthProvider';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { LogIn, ShoppingBasket, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const { signInWithGoogle } = useAuth();

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
          <CardContent className='space-y-8 pb-10 px-8'>
            <div className='space-y-4'>
              <div className='flex items-center space-x-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-colors hover:bg-white dark:hover:bg-zinc-700 group'>
                <div className='bg-white dark:bg-zinc-700 p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform'>
                  <Sparkles className='h-5 w-5 text-green-500' />
                </div>
                <div>
                  <h4 className='font-bold text-zinc-900 dark:text-zinc-50 leading-tight'>
                    Reduce waste
                  </h4>
                  <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                    Track expiry dates and eat fresh.
                  </p>
                </div>
              </div>
              <div className='flex items-center space-x-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 transition-colors hover:bg-white dark:hover:bg-zinc-700 group'>
                <div className='bg-white dark:bg-zinc-700 p-2 rounded-xl shadow-sm group-hover:scale-110 transition-transform'>
                  <ShieldCheck className='h-5 w-5 text-blue-500' />
                </div>
                <div>
                  <h4 className='font-bold text-zinc-900 dark:text-zinc-50 leading-tight'>
                    Simple & Secure
                  </h4>
                  <p className='text-xs text-zinc-500 dark:text-zinc-400'>
                    Sign in with your Google account.
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={signInWithGoogle}
              className='hover:cursor-pointer w-full h-14 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg shadow-xl shadow-zinc-900/10 flex items-center justify-center gap-3 transition-all active:scale-95'
            >
              <LogIn className='h-5 w-5' />
              Sign in with Google
            </Button>

            <p className='text-center text-xs text-zinc-400 dark:text-zinc-500'>
              By signing in, you agree to track your hunger level responsibly.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
