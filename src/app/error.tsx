"use client";

export default function Error({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <div className="container mx-auto space-y-3 px-4 py-8">
      <h2 className="text-lg font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        We could not complete your request. Please try again.
      </p>
      <button
        className="rounded bg-primary px-4 py-2 text-primary-foreground"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
