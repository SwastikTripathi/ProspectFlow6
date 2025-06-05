
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

  const isCollapsedDesktop = sidebarState === 'collapsed' && !isMobile;
  const isExpandedDesktop = sidebarState === 'expanded' && !isMobile;

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
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
              className={cn(item.disabled && "cursor-not-allowed opacity-50")}
              tooltip={item.label} 
            >
              <Link
                href={item.href}
                aria-disabled={item.disabled}
                tabIndex={item.disabled ? -1 : undefined}
                onClick={(e) => {
                  if (item.disabled) {
                    e.preventDefault();
                  }
                }}
              >
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );

  return (
    <div className="flex flex-col h-full">
      <div>
        {renderNavItems(mainNavItems)}
      </div>

      {favoriteJobOpenings && favoriteJobOpenings.length > 0 && (
        <>
          <SidebarSeparator />
          <div className="flex-1 min-h-0 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only">
                Favorites
              </SidebarGroupLabel>
              <SidebarMenu>
                {favoriteJobOpenings.map((opening) => {
                  const favoriteDisplayName = `${opening.role_title} @ ${opening.company_name_cache}`;
                  
                  return (
                    <SidebarMenuItem key={opening.id} className="group/favorite-item">
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              asChild
                              className="w-full"
                              // Do not pass 'tooltip' prop here; use the outer Tooltip for all cases
                            >
                              <Link href={`/job-openings?view=${opening.id}`}>
                                <Star className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
                                <span className={cn("truncate ml-2", isCollapsedDesktop ? "hidden" : "group-data-[collapsible=icon]:hidden")}>
                                  {favoriteDisplayName}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {/* This TooltipContent handles both expanded (bottom) and collapsed (right) states */}
                          {(!isMobile) && ( // Only show tooltips on desktop
                            <TooltipContent
                              side={isExpandedDesktop ? "bottom" : "right"}
                              align={isExpandedDesktop ? "start" : "center"}
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
