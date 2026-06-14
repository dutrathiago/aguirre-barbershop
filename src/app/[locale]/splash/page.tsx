'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import styles from './splash.module.css';

export default function SplashPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('splash');
  const { user, loading, appUser } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (user && appUser) {
        if (appUser.role === 'barber' || appUser.role === 'dev') {
          router.push(`/${locale}/admin/dashboard`);
        } else {
          router.push(`/${locale}/home`);
        }
      } else {
        router.push(`/${locale}/login`); // Skipping onboarding for now
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, loading, appUser, router, locale]);

  return (
    <div className={styles.container}>
      <div className={styles.logoContainer}>
        <div className="animate-fadeInScale">
          <Image 
            src="/logo.png" 
            alt="Aguirre Barbershop" 
            width={160} 
            height={160} 
            priority
          />
        </div>
        <h1 className={`${styles.tagline} font-serif animate-fadeIn`}>
          {t('tagline')}
        </h1>
      </div>
      <div className={styles.loader}>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
}
