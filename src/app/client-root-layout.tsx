'use client';

import React from 'react';
import '../../styles/globals.css';
import { Provider } from 'react-redux';
import store from '../../store/store';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <html lang="ko">
        <body>{children}</body>
      </html>
    </Provider>
  );
}
