// Flat header band for the candidate job card: a gold half-disc rising over a green horizon.
// Plain shapes only: no image, no gradient.
export default function SunBand() {
  return (
    <div aria-hidden className="relative -mx-6 -mt-6 h-16 overflow-hidden rounded-t-[15px] bg-paper">
      <span className="absolute bottom-2.5 left-1/2 h-10 w-20 -translate-x-1/2 rounded-t-full bg-accent" />
      <span className="absolute inset-x-0 bottom-0 h-2.5 bg-primary" />
    </div>
  );
}
