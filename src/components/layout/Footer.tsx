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
    <footer className="text-sm">
      <Separator className="mb-3" />
      <div className="flex justify-center gap-2 items-center mb-2">
        <FooterHyperlink href="https://discord.gg/8szspZVj9F">
          <DiscordIcon className="fill-current" width={20} />
          {/* <span>Discord</span> */}
        </FooterHyperlink>
        <p className="text-lg">•</p>
        <FooterHyperlink href="https://github.com/cjpais/LocalScore">
          <div className="flex gap-1 items-center">
            <GithubIcon className="fill-current" width={20} />
            <span>Website</span>
          </div>
        </FooterHyperlink>
        <p className="text-lg">•</p>
        <FooterHyperlink href="https://github.com/Mozilla-Ocho/llamafile/tree/main/localscore">
          <div className="flex gap-1 items-center">
            <GithubIcon className="fill-current" width={20} />
            <span>CLI</span>
          </div>
        </FooterHyperlink>
        <p className="text-lg">•</p>
        <FooterHyperlink
          href="mailto:contact@localscore.ai"
          className="flex items-center gap-1"
        >
          <EmailIcon className="fill-current" width={16} />
          <span>contact@localscore.ai</span>
        </FooterHyperlink>
      </div>
      <div className="flex justify-center gap-2 items-center">
        <FooterHyperlink href="https://builders.mozilla.org/">
          A Mozilla Builders Project
        </FooterHyperlink>
      </div>
    </footer>
  );
};

export default Footer;
