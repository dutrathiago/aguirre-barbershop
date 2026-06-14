import BottomNav from '@/components/layout/BottomNav';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  );
}
