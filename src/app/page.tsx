import { site } from "@/lib/site";

// Temporary placeholder. Spec 01 replaces it.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-3 px-4 py-24">
      <h1 className="text-3xl font-semibold">{site.name}</h1>
      <p>{site.description}</p>
    </main>
  );
}
