import Header from "@/components/Header";
import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Header />
      <main className="flex flex-col max-w-2xl mx-auto gap-5">
        <Component {...pageProps} />
      </main>
    </>
  );
}
