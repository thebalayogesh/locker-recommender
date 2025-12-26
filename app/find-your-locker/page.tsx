export default function FindYourLockerPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      {/* HERO */}
      <section className="mb-12">
        <h1 className="text-3xl font-semibold mb-4">
          Find the Right Locker for Your Space
        </h1>
        <p className="text-gray-600 mb-6">
          Answer a few simple questions to see lockers that suit your space and needs.
          Final size and model selection will be guided by our locker expert.
        </p>
        <a
          href="/find-your-locker/measure"
          className="inline-block bg-black text-white px-6 py-3 rounded-md"
        >
          🔍 Start Locker Finder
        </a>
      </section>

      {/* HOW IT WORKS */}
      <section className="mb-12">
        <h2 className="text-xl font-medium mb-6">How it works</h2>
        <ol className="space-y-4 text-gray-700">
          <li>
            <strong>1. Measure your available space</strong><br />
            Height, width, and depth where you plan to place the locker.
          </li>
          <li>
            <strong>2. View suitable locker options</strong><br />
            We shortlist lockers that fit your space and requirements.
          </li>
          <li>
            <strong>3. Get expert guidance before purchase</strong><br />
            Our specialist helps you choose the right model and size.
          </li>
        </ol>
      </section>

      {/* TRUST */}
      <section className="mb-12">
        <ul className="space-y-2 text-gray-700">
          <li>✔ Avoid wrong size selection</li>
          <li>✔ Shortlisted models only</li>
          <li>✔ Expert assistance before buying</li>
        </ul>
      </section>

      {/* FINAL CTA */}
      <section>
        <a
          href="/find-your-locker/measure"
          className="inline-block border border-black px-6 py-3 rounded-md"
        >
          Start Finding My Locker →
        </a>
      </section>
    </main>
  );
}
