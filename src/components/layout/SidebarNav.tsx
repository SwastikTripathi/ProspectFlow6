
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
                  const isCollapsedDesktop = sidebarState === 'collapsed' && !isMobile;
                  const isExpandedDesktop = sidebarState === 'expanded' && !isMobile;
                  
                  // console.log(`[SidebarNav Favorite Item: ${opening.id}] DisplayName: "${favoriteDisplayName}"`, {isCollapsedDesktop, isExpandedDesktop});

                  const sidebarMenuButtonTooltipProp = isCollapsedDesktop 
                    ? { children: favoriteDisplayName, side: "right" as const, align: "center" as const, className: "whitespace-normal max-w-xs" }
                    : undefined;
                  
                  // if (isCollapsedDesktop) {
                  //   console.log(`[SidebarNav Favorite Item: ${opening.id}] Providing tooltip to SidebarMenuButton:`, sidebarMenuButtonTooltipProp);
                  // } else {
                  //   console.log(`[SidebarNav Favorite Item: ${opening.id}] NOT providing tooltip to SidebarMenuButton.`);
                  // }

                  return (
                    <SidebarMenuItem key={opening.id} className="group/favorite-item">
                      <TooltipProvider key={`tp-${opening.id}`}>
                        <Tooltip key={`t-${opening.id}`} delayDuration={100}>
                          <TooltipTrigger asChild>
                            <Link href={`/job-openings?view=${opening.id}`} passHref legacyBehavior>
                              <SidebarMenuButton
                                asChild
                                tooltip={sidebarMenuButtonTooltipProp}
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
                          {/* Custom Tooltip for EXPANDED sidebar desktop */}
                          {isExpandedDesktop && (
                            <TooltipContent
                              side="bottom"
                              align="start"
                              className="whitespace-normal max-w-xs z-50 bg-popover text-popover-foreground"
                              sideOffset={5}
                            >
                              {/* {console.log(`[SidebarNav Favorite Item: ${opening.id}] Rendering EXPANDED tooltip content.`)} */}
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
