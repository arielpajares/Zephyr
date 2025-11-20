import { ReactNode } from 'react'
import ReactQueryProvider from './providers'
import Navbar from '@/components/Navbar';
import '@/app/global.css'

export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <ReactQueryProvider>
                <body className="antialiased">
                    <Navbar />
                    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                            {children}
                    </main>
                </body>
            </ReactQueryProvider>
        </html>
    )
}