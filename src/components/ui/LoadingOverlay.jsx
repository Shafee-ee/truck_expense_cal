export default function LoadingOverlay({
  show,
  title = "Loading...",
  message = "Please wait...",
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-800 p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 h-12 w-12 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />

          <h2 className="text-xl font-semibold text-white">{title}</h2>

          <p className="mt-3 text-sm text-zinc-400">{message}</p>

          <p className="mt-6 text-xs text-zinc-500">
            This may take a few moments...
          </p>
        </div>
      </div>
    </div>
  );
}
