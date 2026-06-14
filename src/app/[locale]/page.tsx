import { redirect } from 'next/navigation';

export default async function RootPage({ params }: { params: { locale: string } }) {
  const { locale } = await params;
  redirect(`/${locale}/splash`);
}
