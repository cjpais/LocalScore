import { Html, Head, Main, NextScript } from "next/document";
import Link from "next/link";

export default function Document() {
  return (
    <Html lang="en">
      <Head />
      <body className="p-8">
        <header className="pb-4">
          <Link href="/" className="text-heading-lg font-zilla font-semibold">
            llamascore
          </Link>
        </header>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
