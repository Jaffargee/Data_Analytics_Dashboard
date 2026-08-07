import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";

interface NavItemProps {
      label: string;
      icon: React.ReactNode | any;
      path: string;
      active?: boolean;
      onClose?: () => void;
}

export default function NavItem ({ label, icon: Icon, path, active, onClose }: NavItemProps) {
      return (
            <NavLink key={path} to={path} onClick={onClose}>
                  <div
                        className={cn('border outline-none flex items-center gap-4 px-4 py-2 rounded-full text-sm font-body transition-all duration-200 group',
                              active ? 'bg-accent-gold/10 text-accent-gold border-accent-gold/20' : 'text-ink-secondary hover:text-ink-primary hover:bg-bg-hover border-transparent'
                        )}
                  >
                        <Icon size={18} className={cn('flex-shrink-0 transition-colors', active ? 'text-accent-gold' : 'text-ink-secondary group-hover:text-ink-secondary')} />
                        <span className="flex-1 truncate">
                              {label}
                        </span>
                        {active && (
                              <ChevronRight size={18} className="text-accent-gold/60 flex-shrink-0" />
                        )}
                  </div>
            </NavLink>
      )
}