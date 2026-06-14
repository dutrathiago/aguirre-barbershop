'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { loginUser, registerClient } from '@/lib/auth';
import styles from './login.module.css';

export default function LoginPage() {
  const t = useTranslations('login');
  const router = useRouter();
  const locale = useLocale();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerClient(name, email, phone, password);
      }
      router.push(`/${locale}/home`);
    } catch (err: any) {
      setError(err.message || t('errorInvalidCredentials'));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <Image src="/logo.png" alt="Logo" width={80} height={80} />
          <h1 className="font-serif text-primary-color mt-4 text-2xl">{t('title')}</h1>
          <p className="text-secondary-color mt-2">{t('subtitle')}</p>
        </div>

        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${isLogin ? styles.activeTab : ''}`}
            onClick={() => setIsLogin(true)}
          >
            {t('enter')}
          </button>
          <button 
            className={`${styles.tab} ${!isLogin ? styles.activeTab : ''}`}
            onClick={() => setIsLogin(false)}
          >
            {t('createAccount')}
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">{t('name')}</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder={t('namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">{t('phone')}</label>
                <input 
                  type="tel" 
                  className="form-input" 
                  placeholder={t('phonePlaceholder')}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required 
                />
              </div>
            </>
          )}
          
          <div className="form-group">
            <label className="form-label">{t('email')}</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">{t('password')}</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className="btn btn-primary btn-full mt-4">
            {isLogin ? t('enter') : t('createAccount')}
          </button>
        </form>

        <div className={styles.footer}>
          <button 
            onClick={() => router.push(`/${locale}/admin-login`)}
            className="btn btn-ghost mt-4"
          >
            {t('adminAccess')}
          </button>
        </div>
      </div>
    </div>
  );
}
