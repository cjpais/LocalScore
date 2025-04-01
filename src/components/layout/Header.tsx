import Link from "next/link";
import Image from "next/image";
import React from "react";
import SearchBar from "./SearchBar";
import Separator from "../ui/Separator";
import { useRouter } from "next/router";

const Header = () => {
  return (
    <header className="sm:pb-5 pb-3">
      <div className="relative flex flex-col gap-2 xl:flex-row items-center justify-center pb-5">
        <Banner />

        <NavigationLinks />

        <SearchBar className="w-full max-w-xl" />
      </div>

      <Separator />
    </header>
  );
};

const Banner = () => {
  return (
    <div className="xl:absolute xl:left-12">
      <Link href="/" className="text-heading-lg font-zilla font-semibold">
        <Image
          src="/banner.png"
          className="w-auto max-w-60 sm:max-w-full"
          alt="logo"
          width={250}
          height={100}
          priority
        />
      </Link>
    </div>
  );
};

const NavigationLinks = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <div className="flex xl:absolute xl:left-0 xl:top-[120px] xl:px-12 xl:flex-col xl:gap-2 gap-4 max-w-full overflow-x-auto">
      <HeaderLink href="/" currentPath={currentPath}>
        Home
      </HeaderLink>
      <HeaderLink href="/latest" currentPath={currentPath}>
        Latest Results
      </HeaderLink>
      <HeaderLink href="/download" currentPath={currentPath}>
        Download
      </HeaderLink>
      <HeaderLink href="/about" currentPath={currentPath}>
        About
      </HeaderLink>
      <HeaderLink href="/blog" currentPath={currentPath}>
        Blog
      </HeaderLink>
    </div>
  );
};

const HeaderLink = ({
  href,
  children,
  currentPath,
}: {
  href: string;
  children: React.ReactNode;
  currentPath: string;
}) => {
  const isActive = currentPath === href;

  return (
    <Link
      href={href}
      className={`rounded-md px-5 py-[10px] font-medium w-fit sm:text-sm text-xs whitespace-nowrap hover:bg-primary-500 hover:text-white ${
        isActive
          ? "bg-primary-500 text-white"
          : "bg-primary-100 text-primary-500"
      }`}
    >
      {children}
    </Link>
  );
};

export default Header;
