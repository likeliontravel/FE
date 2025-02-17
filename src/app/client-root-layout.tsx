'use client';

import React from 'react';
import '../../styles/globals.css';
import { Provider } from 'react-redux';
import store from '../../store/store';
import Header from '@/app/_component/Header';
import Footer from '@/app/_component/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <html lang="ko">
        <body>
          <Header />
          {children}
          <Footer />
        </body>
      </html>
    </Provider>
  );
}
