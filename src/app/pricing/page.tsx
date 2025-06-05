
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, type ButtonProps } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Circle, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ALL_AVAILABLE_PLANS } from '@/lib/config';
import type { AvailablePlan, PlanFeature, SubscriptionTier } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/icons/Logo';
import { Around } from "@theme-toggles/react";
import "@theme-toggles/react/css/Around.css";
import { Facebook, Twitter, Youtube, Linkedin, Globe } from 'lucide-react'; // For footer

interface PublicPlanDisplayInfo {
  isFree: boolean;
  isDiscounted: boolean;
  originalTotalPrice?: number;
  discountedPricePerMonth?: number;
  finalTotalPrice: number;
  priceMonthlyDirect?: number;
  durationMonths: number;
  discountPercentage?: number;
}

const calculatePublicPlanDisplayInfo = (plan: AvailablePlan): PublicPlanDisplayInfo => {
  if (plan.databaseTier === 'free') {
    return {
      isFree: true,
      isDiscounted: false,
      finalTotalPrice: 0,
      durationMonths: plan.durationMonths,
    };
  }

  const originalTotal = plan.priceMonthly * plan.durationMonths;
  let finalTotal = originalTotal;
  let discountedPerMonth;

  if (plan.discountPercentage && plan.discountPercentage > 0) {
    const discountAmount = originalTotal * (plan.discountPercentage / 100);
    finalTotal = originalTotal - discountAmount;
    discountedPerMonth = Math.round(finalTotal / plan.durationMonths);
    return {
      isFree: false,
      isDiscounted: true,
      originalTotalPrice: Math.round(originalTotal),
      discountedPricePerMonth: discountedPerMonth,
      finalTotalPrice: Math.round(finalTotal),
      durationMonths: plan.durationMonths,
      discountPercentage: plan.discountPercentage,
    };
  } else {
    return {
      isFree: false,
      isDiscounted: false,
      priceMonthlyDirect: plan.priceMonthly,
      finalTotalPrice: Math.round(originalTotal),
      durationMonths: plan.durationMonths,
    };
  }
};

const footerLinks = {
    product: [
      { name: 'Overview', href: '#' }, { name: 'Communication', href: '#' }, { name: 'Automation', href: '#' }, { name: 'Integrations', href: '#' },
      { name: 'Reporting', href: '#' }, { name: 'SMS', href: '#' }, { name: 'Calling', href: '#' }, { name: 'Security', href: '#' },
    ],
    pricing: [
      { name: 'Pricing', href: '/pricing' }, { name: 'Close vs Other CRMs', href: '#' }, { name: 'Close for Startups', href: '#' },
      { name: 'Customer Stories', href: '#' }, { name: 'Inbound Sales', href: '#' }, { name: 'Outbound Sales', href: '#' },
    ],
    resources: [
      { name: 'Blog', href: '/blog' }, { name: 'Ebooks + Templates', href: '#' }, { name: 'Guides', href: '#' }, { name: 'See a demo video', href: '#' },
      { name: 'Office Hours', href: '#' }, { name: 'Sales Tools', href: '#' },
    ],
    company: [
      { name: 'About', href: '/about' }, { name: 'Careers', href: '#' }, { name: 'Partner with Close', href: '#' }, { name: 'Brand Guidelines', href: '#' },
      { name: 'Terms', href: '#' }, { name: 'Privacy', href: '#' }, { name: 'GDPR', href: '#' }, { name: 'CCPA', href: '#' },
    ],
    getHelp: [
      { name: '+1-833-GO-CLOSE', href: 'tel:+18334625673' }, { name: 'Help Center', href: '#' }, { name: 'API Documentation', href: '#' },
      { name: 'Download the Close App', href: '#' }, { name: 'Product Updates', href: '#' }, { name: '2025 Product Roadmap', href: '#' },
      { name: 'System Status', href: '#' },
    ],
  };


export default function PricingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      localStorage.setItem('theme', newTheme);
      return newTheme;
    });
  };

  const handleSelectPlanPublic = (planName: string) => {
    toast({
      title: 'Authentication Required',
      description: 'Please sign up or sign in to select a plan.',
      duration: 5000,
    });
    router.push('/auth?source=pricing');
  };

  const displayedPlans = ALL_AVAILABLE_PLANS.map((plan) => {
    const priceInfo = calculatePublicPlanDisplayInfo(plan);
    let ctaText = "Choose Plan";
    let finalButtonVariant: ButtonProps['variant'] = 'secondary';

    if (plan.databaseTier === 'free') {
      ctaText = "Get Started Free";
    } else if (plan.isPopular) {
        finalButtonVariant = 'default';
    }

    return {
      ...plan,
      priceInfo,
      ctaText,
      finalButtonVariant,
    };
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center justify-between mx-auto px-[5vw] md:px-[10vw]">
          <Link href="/landing" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <Button variant="ghost" asChild className="rounded-full text-primary font-semibold">
              <Link href="/pricing">Pricing</Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/about">About</Link>
            </Button>
            <Around
              toggled={theme === 'dark'}
              onClick={toggleTheme}
              title="Toggle theme"
              aria-label="Toggle theme"
              className={cn(
                "theme-toggle text-foreground/70 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                "h-7 w-7 p-0.5"
              )}
              style={{ '--theme-toggle__around--duration': '500ms' } as React.CSSProperties}
            />
            <Button variant="ghost" asChild className="rounded-full">
              <Link href="/auth">Sign In</Link>
            </Button>
            <Button asChild className="shadow-md rounded-full">
              <Link href="/auth?action=signup">Try for free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 py-12 md:py-20">
        <section className="container mx-auto px-[5vw] md:px-[10vw] text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter mb-6 font-headline text-foreground">
            Simple, Transparent Pricing
          </h1>
          <p className="max-w-xl mx-auto text-md sm:text-lg text-muted-foreground">
            Choose the plan that's right for you and supercharge your outreach efforts.
            <br/>
            All paid plans offer the same premium features and limits.
          </p>
        </section>

        <section className="container mx-auto px-[5vw] md:px-[10vw]">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-stretch">
            {displayedPlans.map((plan) => {
              const { priceInfo } = plan;
              return (
                <Card key={plan.id} className={cn(
                    "flex flex-col shadow-xl hover:shadow-2xl transition-shadow duration-300 relative",
                    plan.isPopular && plan.databaseTier === 'premium' ? 'border-primary border-2' : ''
                )}>
                  {plan.isPopular && plan.databaseTier === 'premium' && (
                     <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <div className="bg-primary text-primary-foreground text-xs font-semibold py-1 px-3 rounded-full shadow-md">
                        Most Popular
                        </div>
                    </div>
                  )}
                  <CardHeader className={cn("pb-4", plan.isPopular && plan.databaseTier === 'premium' && "pt-7")}>
                    <CardTitle className="font-headline text-2xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-1">
                    <div className="text-4xl font-bold mb-1 min-h-[3rem] flex items-baseline">
                      {priceInfo.isFree ? (
                        "Free"
                      ) : priceInfo.isDiscounted && priceInfo.discountedPricePerMonth ? (
                        <div className="flex items-baseline flex-wrap gap-x-1.5">
                          <div className="flex items-baseline">
                             <span className="font-normal" style={{ fontFamily: 'Arial' }}>₹</span>
                             <span className="font-bold">{priceInfo.discountedPricePerMonth}</span>
                             <span className="text-base font-normal text-muted-foreground self-end">/mo</span>
                          </div>
                          {priceInfo.discountPercentage && (
                            <span className="text-sm font-semibold text-green-600">
                              ({priceInfo.discountPercentage}% off)
                            </span>
                          )}
                        </div>
                      ) : (
                        priceInfo.priceMonthlyDirect && (
                            <div className="flex items-baseline">
                            <span className="font-normal" style={{ fontFamily: 'Arial' }}>₹</span>
                            <span className="font-bold">{priceInfo.priceMonthlyDirect}</span>
                            <span className="text-base font-normal text-muted-foreground self-end">/mo</span>
                            </div>
                        )
                      )}
                    </div>
                     <p className="text-xs text-muted-foreground min-h-[1.5em]">
                      {!priceInfo.isFree ?
                       ( <>Total: <span className="font-normal" style={{ fontFamily: 'Arial' }}>₹</span><span className="font-bold">{priceInfo.finalTotalPrice}</span> for {priceInfo.durationMonths} month{priceInfo.durationMonths > 1 ? 's' : ''}</> )
                       : "Forever!"
                      }
                    </p>
                    <ul className="space-y-2 text-sm pt-3">
                      {plan.features.map((feature, index) => (
                        <li key={index} className={`flex items-center ${feature.included ? 'text-foreground' : 'text-muted-foreground line-through'}`}>
                          {feature.included ? <CheckCircle className="mr-2 h-4 w-4 text-green-500 flex-shrink-0" /> : <Circle className="mr-2 h-4 w-4 text-muted-foreground flex-shrink-0" />}
                          {feature.text}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleSelectPlanPublic(plan.name)}
                      variant={plan.finalButtonVariant}
                    >
                      {plan.ctaText}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
           <div className="text-center mt-12">
             <p className="text-muted-foreground">Have questions? <a href="#" className="text-primary hover:underline">Contact Sales</a></p>
           </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-300 mt-auto pt-12 md:pt-16">
        <div className="container mx-auto px-[5vw] md:px-[10vw] py-12">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Product</h5>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Pricing & Use Cases</h5>
              <ul className="space-y-2">
                {footerLinks.pricing.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Resources</h5>
              <ul className="space-y-2">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Company</h5>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-slate-50 mb-4">Get Help</h5>
              <ul className="space-y-2">
                {footerLinks.getHelp.map((link) => (
                  <li key={link.name}><Link href={link.href} className="hover:text-primary transition-colors">{link.name}</Link></li>
                ))}
              </ul>
              <div className="mt-4">
                 <Button variant="outline" className="w-full justify-between bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200 hover:text-slate-50">
                    <span>Language</span>
                    <Globe className="h-4 w-4 opacity-50" />
                </Button>
              </div>
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
    </div>
  );
}
