import './globals.css'
export const metadata = {
    title: 'logisco',
    description: 'Truck expense tracking',
}

export default function RootLayout({ children }) {
    return (
        <html>
            <body>
                {children}
            </body>
        </html>
    )
}