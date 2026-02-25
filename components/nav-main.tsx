"use client"

import { IconCirclePlusFilled, IconLock, IconMail, type Icon } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function NavMain({
  items,
  label,
  showQuickCreate = false, // only the first NavMain (General) needs Quick Create
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    isActive?: boolean
    onClick?: () => void
    disabled?: boolean
    disabledReason?: string
  }[]
  label?: React.ReactNode  // optional group label (e.g. company name + role badge)
  showQuickCreate?: boolean
}) {
  return (
    <SidebarGroup>

      {/* Group label — only renders when provided (used for company section) */}
      {label && <SidebarGroupLabel asChild>{label}</SidebarGroupLabel>}

      <SidebarGroupContent className="flex flex-col gap-2">

        {/* Quick Create — only shown when explicitly enabled */}
        {showQuickCreate && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip="Quick Create"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconCirclePlusFilled />
                <span>Quick Create</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
              >
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        )}

        <SidebarMenu>
          {items.map((item) =>
            // ── Locked / disabled item ──
            item.disabled ? (
              <SidebarMenuItem key={item.title}>
                <div
                  title={item.disabledReason}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded-md w-full opacity-35 cursor-not-allowed select-none text-sm"
                >
                  {item.icon && <item.icon className="size-4 shrink-0" />}
                  <span className="flex-1">{item.title}</span>
                  <IconLock className="size-3 shrink-0" />
                </div>
              </SidebarMenuItem>
            ) : (
              // ── Normal item ──
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={item.isActive}
                  asChild
                  onClick={item.onClick}
                >
                  <Link href={item.url}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          )}
        </SidebarMenu>

      </SidebarGroupContent>
    </SidebarGroup>
  )
}