import React, { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "./Footer";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-[30px] pt-[30px]">
        <Header />
      </div>
      <main className="flex-grow px-[30px] py-5">
        <div className="flex flex-col max-w-2xl mx-auto gap-5 w-full">
          {children}
        </div>
      </main>
      <div className="px-[30px] pb-3">
        <Footer />
      </div>
    </div>
  );
}
