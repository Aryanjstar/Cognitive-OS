"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Logo } from "@/components/shared/logo";
import { Separator } from "@/components/ui/separator";
import { Github, Linkedin, Twitter, Globe, Phone, Mail } from "lucide-react";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Pricing", href: "#pricing" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Resources: [
    { label: "Documentation", href: "https://github.com/Aryanjstar/Cognitive-OS#readme" },
    { label: "API Reference", href: "https://github.com/Aryanjstar/Cognitive-OS#api-endpoints" },
    { label: "GitHub Repository", href: "https://github.com/Aryanjstar/Cognitive-OS" },
    { label: "Research Paper", href: "https://github.com/Aryanjstar/Cognitive-OS#cognitive-load-formula" },
  ],
  Company: [
    { label: "About the Creator", href: "https://aryanjaiswal.in" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/aryanjstar/" },
    { label: "Contact Us", href: "mailto:aryanjstar3@gmail.com" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
};

const socials = [
  { icon: Github, href: "https://github.com/Aryanjstar/Cognitive-OS", label: "GitHub" },
  { icon: Linkedin, href: "https://www.linkedin.com/in/aryanjstar/", label: "LinkedIn" },
  { icon: Twitter, href: "https://x.com/Aryanjstar", label: "X (Twitter)" },
  { icon: Globe, href: "https://aryanjaiswal.in", label: "Portfolio" },
];

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-12 md:grid-cols-4"
        >
          <div>
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Observability for developer cognition. Built to protect the most
              valuable asset in engineering: focused attention.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-all duration-300 hover:border-foreground/30 hover:text-foreground hover:-translate-y-0.5"
                >
                  <social.icon size={16} />
                </a>
              ))}
            </div>
            <div className="mt-5 space-y-2">
              <a
                href="tel:+919794771263"
                className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Phone size={12} />
                +91 97947 71263
              </a>
              <a
                href="mailto:aryanjstar3@gmail.com"
                className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Mail size={12} />
                aryanjstar3@gmail.com
              </a>
            </div>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-foreground/40">
                {category}
              </h4>
              <ul className="mt-5 space-y-3.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="text-sm text-muted-foreground transition-all duration-300 hover:text-foreground hover:translate-x-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
        <Separator className="my-10" />
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-xs text-muted-foreground/60">
            &copy; {new Date().getFullYear()} Cognitive OS. Built by{" "}
            <a
              href="https://aryanjaiswal.in"
              target="_blank"
              rel="noopener noreferrer"
              className="underline transition-colors hover:text-foreground"
            >
              Aryan Jaiswal
            </a>
            . All rights reserved.
          </p>
          <div className="flex gap-6">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground/60 transition-all duration-300 hover:text-foreground"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
