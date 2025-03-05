import React, { ReactNode } from "react";
import Header from "@/components/layout/Header";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className="flex flex-col max-w-2xl mx-auto gap-5">{children}</main>
    </>
  );
}
