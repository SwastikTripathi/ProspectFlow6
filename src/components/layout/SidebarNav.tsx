
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
  useSidebar, // Import useSidebar
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'; // Import Tooltip components
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
  const { state: sidebarState, isMobile } = useSidebar(); // Get sidebar state

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
                tooltip={item.label} // Standard tooltip for collapsed state
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
                    <SidebarMenuItem key={opening.id} className="group/favorite-item">
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link href={`/job-openings?view=${opening.id}`} passHref legacyBehavior>
                              <SidebarMenuButton
                                asChild
                                // Pass tooltip object for SidebarMenuButton's internal collapsed state handling
                                tooltip={isMobile ? undefined : { children: favoriteDisplayName, side: "right", align: "center" }}
                                className="w-full"
                              >
                                <a className="flex items-center w-full overflow-hidden">
                                  <Star className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
                                  <span className="truncate group-data-[collapsible=icon]:hidden ml-2">
                                    {favoriteDisplayName}
                                  </span>
                                </a>
                              </SidebarMenuButton>
                            </Link>
                          </TooltipTrigger>
                          {/* This TooltipContent is for the EXPANDED sidebar state hover */}
                          {!isMobile && sidebarState === 'expanded' && (
                            <TooltipContent
                              side="bottom"
                              align="start"
                              className="whitespace-normal max-w-[calc(var(--sidebar-width)-2rem)] z-30 bg-popover text-popover-foreground"
                              sideOffset={5}
                            >
                              {favoriteDisplayName}
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
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
