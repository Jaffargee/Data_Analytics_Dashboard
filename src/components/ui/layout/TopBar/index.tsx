import { Bell, RefreshCw, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MobileSideBar } from '../Sidebar';
import { Avatar } from '@fluentui/react-components';
import Button from '@/components/ui/controls/Button';

interface TopBarProps {
      title: string;
      shouldNavigateBack?: boolean;
      subtitle?: string;
      onRefresh?: () => void;
}

function TopBar({
      title,
      subtitle,
      shouldNavigateBack,
      onRefresh,
}: TopBarProps) {
      const navigate = useNavigate();

      return (
            <header className="h-14 border-b border-bg-border bg-bg-panel/80 backdrop-blur-md px-4 flex items-center justify-between sticky top-0 z-[1000]">
                  <div className="flex flex-row gap-4">
                        {shouldNavigateBack && (
                              <button
                                    onClick={() => navigate(-1)}
                                    className="w-8 h-8 rounded-lg border border-bg-border text-ink-muted hover:text-ink-primary hover:bg-bg-hover flex items-center justify-center transition-all"
                              >
                                    <ArrowLeft size={18} />
                              </button>
                        )}

                        <MobileSideBar />

                        <div>
                              <h1 className="font-body font-bold text-base text-ink-primary leading-tight">
                                    {title}
                              </h1>
                              {subtitle && (
                                    <p className="text-[12px] text-ink-subtle font-body">
                                          {subtitle.slice(0, 30) + '...'}
                                    </p>
                              )}
                        </div>
                  </div>

                  <div className="flex items-center gap-4">
                        {/* Date chip */}
                        <span className="text-[11px] font-mono text-ink-sublte bg-bg-hover border border-bg-border px-4 py-1 rounded-full hidden md:block">
                              {new Date().toLocaleDateString('en-NG', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                              })}
                        </span>

                        {onRefresh && (
                              <Button onClick={onRefresh} className='h-[40px] w-[40px]' radius='full' size='sm' value={'Notification'} variant='accent' icon={<RefreshCw size={18} /> } />
                        )}
                        <Button className='h-[40px] w-[40px]' radius='full' size='sm' value={'Notification'} variant='accent' icon={<Bell size={18} /> } />
                        {/* Avatar */}
                        <Avatar active='active' activeAppearance='shadow' color='neutral' name='Tahir General' shape='circular' size={40} />
                  </div>
            </header>
      );
}

export { TopBar };
export default TopBar;