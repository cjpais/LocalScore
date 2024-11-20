import Link from "next/link";
import Image from "next/image";
import React from "react";
import SearchBar from "./SearchBar";
import Separator from "./Separator";

const Header = () => {
  return (
    <header className="pb-5">
      <div className="grid md:grid-cols-3 grid-cols-1 self-center px-12 py-4">
        <Link href="/" className="text-heading-lg font-zilla font-semibold">
          <Image src="/banner.png" alt="logo" width={300} height={100} />
        </Link>
        <SearchBar className="w-full self-center max-w-xl" />
      </div>
      <Separator className="col-span-3" />
    </header>
  );
};

export default Header;
