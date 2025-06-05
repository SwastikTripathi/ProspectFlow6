
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Users, Building2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import type { JobOpening } from '@/lib/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  disabled?: boolean;
}

const mainNavItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/job-openings', label: 'Job Openings', icon: Briefcase },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/companies', label: 'Companies', icon: Building2 },
];

interface SidebarNavProps {
  favoriteJobOpenings?: JobOpening[];
}

export function SidebarNav({ favoriteJobOpenings = [] }: SidebarNavProps) {
  const pathname = usePathname();

  const renderNavItems = (items: NavItem[], groupLabel?: string) => (
    <SidebarGroup>
      {groupLabel && (
        <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only">
          {groupLabel}
        </SidebarGroupLabel>
      )}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.label}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                className={cn(item.disabled && "cursor-not-allowed opacity-50")}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : undefined}
                onClick={(e) => item.disabled && e.preventDefault()}
                tooltip={item.label}
              >
                <a>
                  <item.icon />
                  <span>{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1">
        {renderNavItems(mainNavItems)}
        {favoriteJobOpenings && favoriteJobOpenings.length > 0 && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only">
                Favorites
              </SidebarGroupLabel>
              <SidebarMenu>
                {favoriteJobOpenings.map((opening) => {
                  const favoriteDisplayName = `${opening.role_title} @ ${opening.company_name_cache}`;
                  return (
                    <SidebarMenuItem key={opening.id}>
                      <Link href={`/job-openings?view=${opening.id}`} passHref legacyBehavior>
                        <SidebarMenuButton
                          asChild
                          tooltip={favoriteDisplayName}
                          className="group" 
                        >
                          <a>
                            <Star className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
                            {/* Viewport for marquee when expanded */}
                            <div className="overflow-hidden whitespace-nowrap w-full group-data-[collapsible=icon]:hidden">
                              {/* Animated container: 200% width of viewport, flex to arrange children */}
                              <div className="flex w-[200%] group-data-[collapsible=expanded]:group-hover:animate-marquee-sidebar">
                                {/* Each child span takes 50% of the 200% width (i.e., 100% of viewport), ensuring text starts at the beginning */}
                                <span className="w-[50%] whitespace-nowrap pr-4 block"> {/* pr-4 for spacing before duplicate starts */}
                                  {favoriteDisplayName}
                                </span>
                                <span className="w-[50%] whitespace-nowrap pl-4 block" aria-hidden="true"> {/* pl-4 to match spacing if text is short */}
                                  {favoriteDisplayName}
                                </span>
                              </div>
                            </div>
                             {/* Text for collapsed view (icon only sidebar) */}
                            <span className="group-data-[collapsible=expanded]:hidden truncate">
                              {opening.role_title}
                            </span>
                          </a>
                        </SidebarMenuButton>
                      </Link>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </>
        )}
      </div>
    </div>
  );
}
