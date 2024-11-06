import Link from "next/link";

export default function Home() {
  return (
    <div>
      <main>
        <div className="flex flex-col gap-4">
          <Link
            className="text-heading-sm font-medium font-zilla text-[#00458b] hover:text-[#005e5e]"
            href="/models"
          >
            Models
          </Link>
          <Link
            className="text-heading-sm font-medium font-zilla text-[#00458b] hover:text-[#005e5e]"
            href="/latest"
          >
            Latest
          </Link>
          <Link
            className="text-heading-sm font-medium font-zilla text-[#00458b] hover:text-[#005e5e]"
            href="/accelerators"
          >
            Accelerators
          </Link>
        </div>
      </main>
      <footer></footer>
    </div>
  );
}
