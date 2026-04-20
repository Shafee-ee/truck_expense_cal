import "./globals.css";
import Link from "next/link";
export const metadata = {
  title: "logisco",
  description: "Truck expense tracking",
};

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav className="bg-black text-white px-6 py-3 flex gap-6">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <Link href="/trips" className="hover:underline">
            Trips
          </Link>
          <Link href="/trucks" className="hover:underline">
            Trucks
          </Link>
        </nav>

        <main>{children}</main>
      </body>
    </html>
  );
}
