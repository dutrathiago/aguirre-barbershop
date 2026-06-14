'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import styles from './BottomNav.module.css';

export default function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('nav');

  const navItems = [
    { name: t('home'), path: `/${locale}/home`, icon: 'home' },
    { name: t('appointments'), path: `/${locale}/appointments`, icon: 'calendar_today' },
    { name: t('chat'), path: `/${locale}/chat`, icon: 'chat' },
    { name: t('profile'), path: `/${locale}/profile`, icon: 'person' },
  ];

  return (
    <nav className={styles.nav}>
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        return (
          <Link href={item.path} key={item.path} className={`${styles.item} ${isActive ? styles.active : ''}`}>
            <span className={`material-symbols-outlined ${isActive ? styles.activeIcon : ''}`}>
              {item.icon}
            </span>
            <span className={styles.label}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
