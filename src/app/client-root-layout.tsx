'use client';

import ReduxProvider from "../../store/ReduxProvider";
import AuthSessionHandler from "./_component/AuthSessionHandler";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <ReduxProvider>
          <AuthSessionHandler>
            {children}
          </AuthSessionHandler>
        </ReduxProvider>
      </body>
    </html>
  );
}