import { useState } from 'react';

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useAuth } from '@/components/AuthProvider';
import Inventory from '@/components/Inventory';
import Login from '@/components/Login';
import UserProfile from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, UserPen } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const [view, setView] = useState<'inventory' | 'profile'>('inventory');

  if (loading) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 space-y-4'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600' />
        <p className='text-zinc-500 font-medium animate-pulse'>
          Checking your kitchen...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className='min-h-screen flex flex-col bg-white dark:bg-zinc-950'>
      <nav className='border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16 items-center'>
            <div
              className='flex items-center space-x-2 hover:cursor-pointer'
              onClick={() => setView('inventory')}
            >
              <svg height='36' viewBox='0 0 142 177' fill='none'>
                <path
                  d='M50.5 21.2861C71.5 34.2861 73.7405 53.971 71.5 80.7861'
                  stroke='#227527'
                  strokeWidth='10'
                  strokeLinecap='round'
                />
                <path
                  d='M111 51.7868C95.1139 47.0283 86.0835 60.7868 69.5 60.7868C52.9165 60.7868 47.999 47.7871 28 51.7868C10.0783 55.371 2.05882e-05 71.0102 0 89.2868C-6.1393e-05 143.787 33.9991 174.287 50.4993 174.287C60.2096 174.287 61.2959 169.44 71 169.787C79.5794 170.093 83.4151 176.287 92 176.287C109 176.287 141.5 133.287 141.5 102.287C141.5 76.2868 133.07 58.3977 111 51.7868Z'
                  fill='url(#paint0_radial_78_5)'
                />
                <path
                  d='M73.8614 15.6759C82.1464 10.2114 103 7.78572 103 7.78572C103 7.78572 100.356 26.7475 92.4927 34.4075C84.6294 42.0676 67.7812 37.3387 67.7812 37.3387C67.7812 37.3387 65.5765 21.1403 73.8614 15.6759Z'
                  fill='#95D473'
                  stroke='#227527'
                  strokeWidth='4'
                  strokeLinecap='round'
                />
                <defs>
                  <radialGradient
                    id='paint0_radial_78_5'
                    cx='0'
                    cy='0'
                    r='1'
                    gradientUnits='userSpaceOnUse'
                    gradientTransform='translate(4.99999 60.2861) rotate(47.7639) scale(153.975 173.604)'
                  >
                    <stop stopColor='#D6F5C6' />
                    <stop offset='0.484999' stopColor='#95D372' />
                    <stop offset='0.937516' stopColor='#71BE56' />
                  </radialGradient>
                </defs>
              </svg>
              <span className='font-black text-xl tracking-tight'>
                Stay Fresh
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant='ghost'
                    className=' hover:cursor-pointer relative h-10 w-10 rounded-full bg-zinc-100 dark:bg-zinc-800 p-0 overflow-hidden outline-none ring-0 focus-visible:ring-2 focus-visible:ring-green-600'
                  >
                    {user.user_metadata.avatar_url ? (
                      <img
                        src={user.user_metadata.avatar_url}
                        alt={user.email || 'User'}
                        className='h-full w-full object-cover'
                        referrerPolicy='no-referrer'
                      />
                    ) : (
                      <UserIcon className='h-5 w-5 text-zinc-500 dark:text-zinc-400' />
                    )}
                  </Button>
                }
              />
              <DropdownMenuContent
                className='w-56 rounded-xl shadow-xl border-zinc-100 dark:border-zinc-700'
                align='end'
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className='font-normal'>
                    <div className='flex flex-col space-y-1'>
                      <p className='text-sm font-bold leading-none'>
                        {user.user_metadata.full_name || user.email}
                      </p>
                      <p className='text-xs leading-none text-zinc-500 dark:text-zinc-400'>
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setView('profile')}
                  className='rounded-lg m-1 cursor-pointer'
                >
                  <UserPen className='mr-2 h-4 w-4' />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={signOut}
                  className='text-destructive focus:text-destructive focus:bg-destructive/10 rounded-lg m-1 cursor-pointer'
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <main className='flex-1'>
        {view === 'profile' ? <UserProfile /> : <Inventory />}
      </main>

      <footer className='border-t border-zinc-100 dark:border-zinc-800 py-4 px-4'>
        <div className='max-w-7xl mx-auto text-center space-y-4'>
          <p className='text-zinc-400 dark:text-zinc-500 text-sm font-medium'>
            &copy; {new Date().getFullYear()} Stay Fresh. All rights reserved.
          </p>
          <div className='flex justify-center space-x-6 text-zinc-300 dark:text-zinc-600 text-xs font-bold uppercase tracking-widest'>
            <span>Fridge</span>
            <span>Pantry</span>
            <span>Freezer</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
