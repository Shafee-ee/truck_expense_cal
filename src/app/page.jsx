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
                    className="text-blue-600 underline"
                >
                    Go to Trips
                </a>
            </div>
        </div>
    );
}
