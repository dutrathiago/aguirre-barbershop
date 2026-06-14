'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import styles from './home.module.css';

export default function HomePage() {
  const t = useTranslations('home');
  const { appUser } = useAuth();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            {appUser?.name?.[0] || 'U'}
          </div>
          <div>
            <p className={styles.greeting}>{t('greeting')},</p>
            <h2 className={styles.name}>{appUser?.name || 'User'}</h2>
          </div>
        </div>
      </header>

      <section className={styles.searchSection}>
        <input 
          type="text" 
          placeholder={t('searchPlaceholder')} 
          className="form-input"
        />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>{t('nearbyBarbers')}</h3>
        <div className={styles.emptyState}>
          {t('noBarbers')}
        </div>
      </section>
    </div>
  );
}
