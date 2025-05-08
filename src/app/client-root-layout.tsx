'use client';

import React from 'react';
import '../../styles/globals.css';
import { Provider } from 'react-redux';
import store from '../../store/store';
import Header from '@/app/_component/Header';

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
        </body>
      </html>
    </Provider>
  );
}
