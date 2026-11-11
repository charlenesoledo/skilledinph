export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section className="mx-auto max-w-[480px]">
      <h1 className="text-2xl font-bold">Candidate View</h1>
      <p className="mt-2 text-stone-600">
        Placeholder para kay {id}: ang kulang mo, ang module mo, sahod, final test, at offer.
      </p>
    </section>
  );
}
