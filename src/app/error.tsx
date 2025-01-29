"use client";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
      <h2 className="text-lg font-semibold">Noget gik galt!</h2>
      <p className="mt-2 text-sm">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
      >
        Prøv igen
      </button>
    </div>
  );
}
