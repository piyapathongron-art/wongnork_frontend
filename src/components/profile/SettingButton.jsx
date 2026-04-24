
import { Settings, User, LogOut, SunIcon, MoonIcon } from "lucide-react"
import useUserStore from '../../stores/userStore';
import { useThemeStore } from '../../stores/themeStore';
import { useNavigate } from "react-router";
import { toast } from "sonner";



function SettingButton({ setIsEditModalOpen }) {
    const logout = useUserStore((state) => state.logout);
    const toggleTheme = useThemeStore((state) => state.toggleTheme)
    const isDark = useThemeStore((state) => state.isDark)
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success("ออกจากระบบสำเร็จ");
            navigate("/");
        } catch (err) {
            toast.error("เกิดข้อผิดพลาด");
        }
    }
    return (
        <div className='dropdown dropdown-end'>
            <div tabIndex={0} role='button' className='p-2 rounded-full hover:bg-base-200 text-accent transition-colors'>
                <Settings size={24} />
            </div>
            <ul tabIndex={0} className='dropdown-content menu bg-base-100 rounded-[2.5rem] z-50 shadow-2xl w-64 p-3 mt-4 border border-base-content/10 ring-1 ring-black/5'>
                <div className='px-4 py-2 mb-1'>
                    <span className='text-[10px] font-black uppercase tracking-widest text-base-content/40'>Settings</span>
                </div>

                <li>
                    <button onClick={() => setIsEditModalOpen(true)} className='flex items-center gap-3 p-3 rounded-2xl hover:bg-primary/10 text-base-content font-bold transition-all active:scale-95'>
                        <div className='w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary'>
                            <User size={18} />
                        </div>
                        <span>Edit Profile</span>
                    </button>
                </li>

                <li onClick={toggleTheme}>
                    <div className='flex justify-between items-center p-3 rounded-2xl hover:bg-base-200 active:bg-transparent group transition-all'>
                        <div className='flex items-center gap-3'>
                            <div className='w-9 h-9 rounded-full bg-base-200 group-hover:bg-primary/10 flex items-center justify-center transition-colors'>
                                {isDark ? <MoonIcon className="w-4 h-4 text-primary transition-colors" /> : <SunIcon className="w-4 h-4 text-primary transition-colors" />}
                            </div>
                            <span className='font-bold'>Appearance</span>
                        </div>
                    </div>
                </li>

                <div className='h-px bg-base-content/10 my-2 mx-3' />

                <li>
                    <button onClick={handleLogout} className='flex items-center gap-3 p-3 rounded-2xl hover:bg-red-500/10 text-red-500 font-bold transition-all active:scale-95'>
                        <div className='w-9 h-9 rounded-full bg-red-500/10 flex items-center justify-center text-red-500'>
                            <LogOut size={18} />
                        </div>
                        <span>Sign Out</span>
                    </button>
                </li>
            </ul>
        </div>
    )
}

export default SettingButton