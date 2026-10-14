import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ScanLine, History, FileText, Info, ChevronLeft, ChevronRight, Leaf } from 'lucide-react'

interface SidebarProps { collapsed: boolean; onToggle: () => void }

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/scanner', label: 'AI Scanner', icon: ScanLine },
  { to: '/history', label: 'Scan History', icon: History },
  { to: '/reports', label: 'Waste Reports', icon: FileText },
  { to: '/about', label: 'About', icon: Info },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`flex h-full flex-col border-r border-[#223027] bg-[#0F1512]/70 backdrop-blur-md transition-[width] duration-200 shrink-0 ${collapsed ? 'w-16' : 'w-60'}`}>
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="clay-icon-tile flex h-11 w-11 shrink-0 items-center justify-center text-[#B7F34A]">
          <Leaf className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <span className="block text-base font-semibold text-[#F5F7F6] tracking-tight">TrashBots</span>
            <span className="block text-[10px] text-[#6B7280] uppercase tracking-wider">Smart waste ops</span>
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3" aria-label="Main">
        {navItems.map((item) => (
          <NavLink
            key={item.to} to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#B7F34A] ${isActive ? 'clay-nav-active text-[#B7F34A]' : 'text-[#9CA3AF] hover:text-[#F5F7F6] rounded-[18px] hover:bg-[#141A17] border border-transparent'}`
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-3">
        <button
          type="button" onClick={onToggle}
          className="flex w-full items-center justify-center rounded-xl border border-[#223027] bg-[#141A17] p-2.5 text-[#9CA3AF] hover:text-[#F5F7F6] hover:border-[#2A3A30] transition-colors focus-visible:ring-2 focus-visible:ring-[#B7F34A]"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <span className="flex items-center gap-2 text-xs"><ChevronLeft className="h-4 w-4" /> Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
