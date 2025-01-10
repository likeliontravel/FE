export const metadata = {
  title: '투리브',
  description: '투리브 웹사이트입니다.',
};

import RootLayout from './client-root-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootLayout>{children}</RootLayout>;
}
