import type { Metadata } from 'next'
import { ReactNode } from 'react'
import { Nunito } from 'next/font/google'
import ReactQueryProvider from './providers' // <-- El proveedor de React Query
import '@/app/global.css'

// Configuración de la fuente (igual que en tu JS)
const nunitoFont = Nunito({
    subsets: ['latin'],
    display: 'swap',
})

// Metadatos (con el tipo importado)
export const metadata: Metadata = {
    title: 'Laravel',
}

// Layout principal (con tipos y el proveedor)
export default function RootLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en" className={nunitoFont.className}>
            <body className="antialiased">
                <ReactQueryProvider>
                    {children}
                </ReactQueryProvider>
            </body>
        </html>
    )
}