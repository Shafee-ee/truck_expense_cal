import "./globals.css";
import Link from "next/link";
import Providers from "@/components/providers";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Logisco",
  description: "Truck expense tracking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#f5f7fb] text-gray-900">
        <Providers>
          <div className="flex min-h-screen">
            {/* SIDEBAR */}
            <aside className="w-64 bg-gradient-to-b from-[#071120] to-[#0b1730] shadow-2xl text-white flex flex-col border-r border-white/10">
              <Sidebar />
            </aside>
            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col">
              {/* TOP HEADER */}
              <header
                className="
    h-20
    bg-white
    border-b
    border-gray-200
    px-8
    flex
    items-center
    justify-between
  "
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Operations Dashboard
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Financial visibility across trips and trucks
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="
        w-10 h-10
        rounded-full
        bg-[#071120]
        text-white
        flex items-center justify-center
        font-semibold
      "
                  >
                    A
                  </div>
                </div>
              </header>

              {/* PAGE CONTENT */}
              <main className="flex-1 p-8 overflow-y-auto">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
