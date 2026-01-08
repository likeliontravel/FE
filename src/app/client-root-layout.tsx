'use client';
import ReduxProvider from "../../store/ReduxProvider";
import AuthSessionHandler from "./_component/AuthSessionHandler";
import Header from "../app/_component/Header";
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
<Header />
<main>{children}</main>
</AuthSessionHandler>
</ReduxProvider>
</body>
</html>
);
}