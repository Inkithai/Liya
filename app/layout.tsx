import type { Metadata } from"next";
import { ThemeProvider } from"next-themes";
import { Toaster } from"sonner";
import"./globals.css";

export const metadata: Metadata = {
 title:"Liya — Your Sri Lankan Shopping Friend",
 description:"A full-screen AI shopping experience powered by Kapruka MCP.",
 metadataBase: new URL("https://liya.kapruka.agent"),
 openGraph: {
 title:"Liya — Your Sri Lankan Shopping Friend",
 description:"Discover, gift, checkout and track Kapruka orders through a warm Sri Lankan shopping friend.",
 type:"website"
 }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return (
 <html lang="en" suppressHydrationWarning>
 <body>
 <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
 {children}
 <Toaster richColors position="top-center" toastOptions={{ style: { borderRadius: 18 } }} />
 </ThemeProvider>
 </body>
 </html>
 );
}
