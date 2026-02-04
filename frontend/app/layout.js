import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from './Providers';
import AuthSync from '@/components/AuthSync';

export const metadata = {
  title: 'LushSecret | E-commerce discreto',
  description: 'Tienda discreta de lencería y juguetes para adultos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-[#0b0b10] text-white" suppressHydrationWarning>
        <Providers>
          <AuthSync />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
