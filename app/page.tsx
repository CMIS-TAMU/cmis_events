export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">
          CMIS Event Management System
        </h1>
        <p className="text-lg mb-8">
          Welcome to the CMIS Event Management Platform
        </p>
        <div className="grid grid-cols-1 gap-4">
          <a
            href="https://github.com/CMIS-TAMU/cmis_events"
            className="text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub →
          </a>
        </div>
      </div>
    </main>
  );
}
