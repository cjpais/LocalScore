import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";
import Image from "next/image";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="p-8 flex flex-col max-w-3xl mx-auto">
        <header className="pb-4 self-center">
          <Link href="/" className="text-heading-lg font-zilla font-semibold">
            <Image src="/banner.png" alt="logo" width={400} height={100} />
          </Link>
        </header>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
