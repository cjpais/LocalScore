import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="bg-[#F9F7FA] p-[30px]">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
