"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Upload,
  Users,
  UserSearch,
  Gift,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Carga de Datos",
    href: "/admin/carga-datos",
    icon: Upload,
  },
  {
    title: "Usuarios",
    href: "/admin/usuarios",
    icon: Users,
  },
  {
    title: "Consultar Cliente",
    href: "/admin/clientes",
    icon: UserSearch,
  },
  {
    title: "Canje de Puntos",
    href: "/admin/canje",
    icon: Gift,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold">
          <span className="text-cyan-400">Club</span> Soytechno
        </h1>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-cyan-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400">
          <Settings className="h-5 w-5" />
          <span>Panel Administrativo</span>
        </div>
      </div>
    </aside>
  );
}
