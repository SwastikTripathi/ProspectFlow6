
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/icons/Logo';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Youtube, Linkedin, Globe, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';

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
      { name: 'Careers', href: '/careers' },
      { name: 'Partner with Us', href: '/partner-with-us' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms & Conditions', href: '/terms-and-conditions' },
    ],
  },
  {
    title: 'Get Help',
    links: [
      { name: 'Contact Us', href: '/contact' },
    ],
  },
];

const sampleCountries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
];

const LOCAL_STORAGE_COUNTRY_KEY = 'prospectflow-selected-country';

export function PublicFooter() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedCountry = localStorage.getItem(LOCAL_STORAGE_COUNTRY_KEY);
    if (storedCountry) {
      setSelectedCountry(storedCountry);
    } else {
      // Default to a country or leave null if no default is desired
      // setSelectedCountry('US'); // Example: Default to US
    }
  }, []);

  const handleCountrySelect = (countryCode: string) => {
    setSelectedCountry(countryCode);
    localStorage.setItem(LOCAL_STORAGE_COUNTRY_KEY, countryCode);
    // Optionally, you could add a toast notification here
    // toast({ title: "Country Selected", description: `Country set to ${sampleCountries.find(c => c.code === countryCode)?.name}.`})
  };

  if (!isMounted) {
    // Avoid hydration mismatch by rendering a placeholder or null until client-side mount
    return (
      <footer className="bg-slate-900 text-slate-300">
        <div className="container mx-auto px-[5vw] md:px-[10vw] py-12 md:py-16">
          {/* Render a simplified or skeleton footer or nothing */}
        </div>
      </footer>
    );
  }

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
            </div>
          ))}
           <div>
              <h5 className="font-bold text-slate-50 mb-4">Preferences</h5>
               <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-slate-50">
                    <span>Country {selectedCountry ? `(${selectedCountry})` : ''}</span>
                    <Globe className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-slate-800 border-slate-700 text-slate-200">
                  <DropdownMenuLabel className="text-slate-400">Select Country</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-700"/>
                  {sampleCountries.map((country) => (
                    <DropdownMenuItem
                      key={country.code}
                      onSelect={() => handleCountrySelect(country.code)}
                      className="hover:!bg-slate-700 hover:!text-slate-50 focus:!bg-slate-700 focus:!text-slate-50"
                    >
                      <span className="flex-1">{country.name}</span>
                      {selectedCountry === country.code && <Check className="h-4 w-4 text-primary" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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
