
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Users, Building2, Star, Edit3, Rss } from 'lucide-react'; // Added Edit3, Rss
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
  separator?: boolean; // Optional separator before this item
}

const mainNavItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: Home },
  { href: '/job-openings', label: 'Job Openings', icon: Briefcase },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/companies', label: 'Companies', icon: Building2 },
];

const blogNavItems: NavItem[] = [
  { href: '/blog', label: 'View Blog', icon: Rss, separator: true },
  { href: '/blog/create', label: 'Create New Post', icon: Edit3 },
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
          <React.Fragment key={item.label}>
            {item.separator && <SidebarSeparator className="my-1" />}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                className={cn(item.disabled && "cursor-not-allowed opacity-50")}
                tooltip={isCollapsedDesktop ? { children: item.label, side: "right", align: "center" } : undefined}
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
          </React.Fragment>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );

  return (
    <div className="flex flex-col h-full">
      <div> {/* Container for main navigation items */}
        {renderNavItems(mainNavItems)}
        {renderNavItems(blogNavItems, "Blog Management")}
      </div>

      {favoriteJobOpenings && favoriteJobOpenings.length > 0 && (
        <>
          <SidebarSeparator />
          <SidebarGroup className="flex flex-col flex-1 min-h-0">
            <SidebarGroupLabel className="group-data-[collapsible=icon]:sr-only shrink-0">
              Favorites
            </SidebarGroupLabel>
            <div className="flex-1 min-h-0 overflow-y-auto">
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
                              tooltip={isCollapsedDesktop ? { children: favoriteDisplayName, side: "right", align: "center" } : undefined}
                            >
                              <Link href={`/job-openings?view=${opening.id}`}>
                                <Star className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
                                <span className={cn("truncate ml-2", isCollapsedDesktop ? "hidden" : "group-data-[collapsible=icon]:hidden")}>
                                  {favoriteDisplayName}
                                </span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          {isExpandedDesktop && (
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
            </div>
          </SidebarGroup>
        </>
      )}
    </div>
  );
}
