export default function HomePage() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Logisco</h1>
            <p className="mt-2 text-gray-600">
                Logistics trip & financial ledger system
            </p>

            <div className="mt-4">
                <a
                    href="/trips"
                    className="text-black bg-green-300 hover:bg-green-500 px-4 py-2 mr-2"
                >
                    🛣️ Go to Trips
                </a>

                <a
                    href="/trucks"
                    className="text-black bg-green-300  hover:bg-green-500 px-4 py-2 "
                >
                    🚚 Go to trucks
                </a>
            </div>
        </div>
    );
}
