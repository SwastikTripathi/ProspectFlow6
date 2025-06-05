
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
  // useSidebar not strictly needed for this CSS-only hover effect visualization,
  // as we rely on data-attributes set by the Sidebar component itself.
} from '@/components/ui/sidebar';
// TooltipProvider and related components are not needed here for the custom "show below" effect,
// as the SidebarMenuButton's own 'tooltip' prop handles the collapsed state.
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
                tooltip={item.label} // Use built-in tooltip for collapsed state
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
                    <SidebarMenuItem key={opening.id} className="relative group/favorite-item">
                      <Link href={`/job-openings?view=${opening.id}`} passHref legacyBehavior>
                        <SidebarMenuButton
                          asChild
                          tooltip={favoriteDisplayName} // This tooltip handles the collapsed state (shows on the right)
                          className="w-full" // Ensure button takes full width to correctly trigger hover for the custom div
                        >
                          <a className="flex items-center w-full overflow-hidden"> {/* Anchor needs full width too */}
                            <Star className="text-yellow-500 fill-yellow-400 flex-shrink-0" />
                            <span className="truncate group-data-[collapsible=icon]:hidden ml-2">
                              {favoriteDisplayName}
                            </span>
                            {/* Screen reader text for collapsed state if main text is hidden */}
                            <span className="sr-only group-data-[collapsible=expanded]:hidden">
                              {favoriteDisplayName}
                            </span>
                          </a>
                        </SidebarMenuButton>
                      </Link>
                      {/* Custom "tooltip" div for expanded sidebar, shown below on hover */}
                      <div
                        className={cn(
                          "absolute left-2 right-2 top-full z-20 mt-1 p-2", // Positioned below, slight margin, takes available width
                          "bg-popover text-popover-foreground shadow-lg rounded-md text-xs",
                          "opacity-0 invisible pointer-events-none", // Base hidden state
                          // Conditional visibility:
                          // Only when the main sidebar ('peer') is expanded AND this item ('group/favorite-item') is hovered
                          "group-data-[state=expanded]/peer:group-hover/favorite-item:opacity-100",
                          "group-data-[state=expanded]/peer:group-hover/favorite-item:visible",
                          "group-data-[state=expanded]/peer:group-hover/favorite-item:pointer-events-auto",
                          "transition-opacity duration-150 ease-in-out"
                        )}
                      >
                        {favoriteDisplayName}
                      </div>
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
