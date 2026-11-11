export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <section>
      <h1 className="text-2xl font-bold">Job Review</h1>
      <p className="mt-2 text-stone-600">
        Placeholder for job {id}: skill breakdown, rate confirmation, module and final test preview, approval, audit view.
      </p>
    </section>
  );
}
