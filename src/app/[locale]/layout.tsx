import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AuthProvider } from '@/hooks/useAuth';
import '@/styles/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aguirre Barbershop',
  description: 'Agende seu horário na Aguirre Barbershop',
  manifest: '/manifest.json',
  themeColor: '#004D2C',
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  const messages = await getMessages();
  
  return (
    <html lang={locale}>
      <body>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL,GRAD@400,0,0&display=swap" rel="stylesheet" />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthProvider>
            <div className="page-wrapper">
              <main className="main-content">
                {children}
              </main>
            </div>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
