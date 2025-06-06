
'use client';

import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Youtube, Linkedin, Globe } from 'lucide-react';

const footerLinkConfig = [
  {
    title: 'Explore',
    links: [
      { name: 'Pricing', href: '/pricing' },
      { name: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '#' }, // Placeholder, update href when page exists
      { name: 'Partner with Us', href: '#' }, // Placeholder
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#' }, // Placeholder
      { name: 'Terms & Conditions', href: '#' }, // Placeholder
    ],
  },
  {
    title: 'Get Help',
    isHelpSection: true, 
    links: [
      { name: 'Contact Us', href: 'mailto:support@prospectflow.com' },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="container mx-auto px-[5vw] md:px-[10vw] py-12 md:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {footerLinkConfig.map((category) => (
            <div key={category.title}>
              <h5 className="font-bold text-slate-50 mb-4">{category.title}</h5>
              <ul className="space-y-2">
                {category.links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="hover:text-primary transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              {category.isHelpSection && (
                <div className="mt-4">
                  <Button variant="outline" className="w-full justify-between bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-slate-50">
                    <span>Language</span>
                    <Globe className="h-4 w-4 opacity-50" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-700 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Logo />
          </div>
          <div className="text-sm text-slate-400 mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} ProspectFlow Inc. All rights reserved.
          </div>
          <div className="flex space-x-4">
            <a href="#" aria-label="Facebook" className="text-slate-400 hover:text-primary transition-colors"><Facebook size={20} /></a>
            <a href="#" aria-label="Twitter" className="text-slate-400 hover:text-primary transition-colors"><Twitter size={20} /></a>
            <a href="#" aria-label="YouTube" className="text-slate-400 hover:text-primary transition-colors"><Youtube size={20} /></a>
            <a href="#" aria-label="LinkedIn" className="text-slate-400 hover:text-primary transition-colors"><Linkedin size={20} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
