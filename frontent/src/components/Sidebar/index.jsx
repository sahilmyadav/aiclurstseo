import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userSidebarConfig, adminSidebarConfig } from './sidebarConfig'

const Sidebar = () => {
  const { user } = useAuth();
  const role = (user?.role || 'user').toLowerCase();
  const sidebarConfig = role === 'admin' ? adminSidebarConfig : userSidebarConfig;
  const displayName = user?.name || sidebarConfig.user.name;
  const displayEmail = user?.email || sidebarConfig.user.email;

  return (
    <aside className="h-screen w-64 shrink-0 bg-[#12122a] text-white border-r border-white/10 flex flex-col">
      <div className="h-14 px-4 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-bold">{sidebarConfig.brand.short}</div>
        <div className="font-semibold">{sidebarConfig.brand.name}</div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-6" style={{scrollbarWidth:'thin'}}>
        {sidebarConfig.sections.map((section, sIdx) => (
          <div key={sIdx}>
            {!!section.title && (
              <div className="px-2 text-[10px] uppercase tracking-wider text-white/40 mb-2">{section.title}</div>
            )}
            <div className="space-y-1">
              {section.items.map((item, iIdx) => (
                <NavLink
                  key={iIdx}
                  to={item.to}
                  className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-md text-sm ${isActive ? 'bg-purple-600/20 text-white border border-purple-500/40' : 'text-white/80 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="w-5 text-center">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold">
          {(displayName || 'U').charAt(0)}
        </div>
        <div className="leading-tight">
          <div className="text-sm font-medium">{displayName}</div>
          <div className="text-xs text-white/50 truncate">{displayEmail}</div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
