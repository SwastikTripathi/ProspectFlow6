
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
  useSidebar,
} from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  const { state: sidebarState, isMobile } = useSidebar();

  // console.log('[SidebarNav] State:', { sidebarState, isMobile });
  // console.log('[SidebarNav] Favorite Openings Prop:', favoriteJobOpenings);


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
            <Link href={item.href} passHref>
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

  const isCollapsedDesktop = sidebarState === 'collapsed' && !isMobile;
  const isExpandedDesktop = sidebarState === 'expanded' && !isMobile;

  return (
    <div className="flex flex-col h-full">
      {/* Main Navigation - Fixed */}
      <div>
        {renderNavItems(mainNavItems)}
      </div>

      {/* Favorites Section - Scrollable */}
      {favoriteJobOpenings && favoriteJobOpenings.length > 0 && (
        <>
          <SidebarSeparator />
          <div className="flex-1 min-h-0 overflow-y-auto"> {/* Scrollable container for favorites */}
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only">
                Favorites
              </SidebarGroupLabel>
              <SidebarMenu>
                {favoriteJobOpenings.map((opening) => {
                  const favoriteDisplayName = `${opening.role_title} @ ${opening.company_name_cache}`;
                  
                  const buttonTooltipProp = isCollapsedDesktop
                    ? { children: favoriteDisplayName, side: "right" as const, align: "center" as const, className: "whitespace-normal max-w-xs" }
                    : undefined;

                  return (
                    <SidebarMenuItem key={opening.id} className="group/favorite-item">
                      <TooltipProvider>
                        <Tooltip delayDuration={isExpandedDesktop ? 0 : 100}> {/* No delay for expanded view custom tooltip */}
                          <TooltipTrigger asChild>
                            <Link href={`/job-openings?view=${opening.id}`} passHref>
                              <SidebarMenuButton
                                asChild
                                tooltip={buttonTooltipProp} // Only for collapsed state
                                className="w-full"
                              >
                                <a className="flex items-center w-full">
                                  <Star className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
                                  <span className={cn("truncate ml-2", isCollapsedDesktop ? "hidden" : "group-data-[collapsible=icon]:hidden")}>
                                    {favoriteDisplayName}
                                  </span>
                                </a>
                              </SidebarMenuButton>
                            </Link>
                          </TooltipTrigger>
                          {isExpandedDesktop && ( // Custom tooltip for expanded state
                            <TooltipContent
                              side="bottom"
                              align="start"
                              className="whitespace-normal max-w-xs z-50 bg-popover text-popover-foreground"
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
          </div>
        </>
      )}
    </div>
  );
}

