import React, { ReactNode } from "react";
import Separator from "../ui/Separator";
import Link from "next/link";
import DiscordIcon from "../icons/DiscordIcon";
import GithubIcon from "../icons/GithubIcon";
import EmailIcon from "../icons/EmailIcon";

const FooterHyperlink = ({
  href,
  children,
  className = "",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) => {
  return (
    <Link
      href={href}
      className={`hover:text-primary-500 hover:underline ${className}`}
    >
      {children}
    </Link>
  );
};

const Footer = () => {
  return (
    <footer>
      <Separator className="mb-3" />
      <div className="flex justify-center gap-2 text-sm items-center mb-2">
        <FooterHyperlink href="https://github.com/cjpais/LocalScore">
          <DiscordIcon className="hover:fill-primary-500" width={20} />
        </FooterHyperlink>
        <p className="text-lg">•</p>
        <FooterHyperlink href="https://github.com/cjpais/LocalScore">
          <GithubIcon className="hover:fill-primary-500" width={20} />
        </FooterHyperlink>
        <p className="text-lg">•</p>
        <FooterHyperlink href="https://github.com/cjpais/llamafile/tree/cjpais/localscore/llama.cpp/localscore">
          GitHub
        </FooterHyperlink>
        <p className="text-lg">•</p>
        <FooterHyperlink
          href="mailto:contact@localscore.ai"
          className="flex items-center gap-1 hover:fill-primary-500"
        >
          <EmailIcon className="" width={16} />
          <span>contact@localscore.ai</span>
        </FooterHyperlink>
      </div>
      <div className="flex justify-center gap-2 text-sm items-center">
        <FooterHyperlink href="https://builders.mozilla.org/">
          A Mozilla Builders Project
        </FooterHyperlink>
      </div>
    </footer>
  );
};

export default Footer;
