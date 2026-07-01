// src/components/Icons.jsx
// Re-export terpusat dari react-icons (Feather icon set/fi), supaya kalau
// suatu saat ingin ganti icon set, cukup ubah di satu file ini saja.
export {
  FiSearch as SearchIcon,
  FiShoppingCart as CartIcon,
  FiStar as StarIcon,
  FiHeart as HeartIcon,
  FiUser as UserIcon,
  FiMapPin as MapPinIcon,
  FiClock as ClockIcon,
  FiPlus as PlusIcon,
  FiMinus as MinusIcon,
  FiX as XIcon,
  FiArrowRight as ArrowRightIcon,
  FiChevronLeft as ChevronLeftIcon,
  FiChevronRight as ChevronRightIcon,
  FiChevronDown as ChevronDownIcon,
  FiTruck as TruckIcon,
  FiTrash2 as TrashIcon,
  FiLogOut as LogOutIcon,
  FiEdit2 as EditIcon,
  FiCheckCircle as CheckCircleIcon,
  FiAlertCircle as AlertCircleIcon,
  FiFilter as FilterIcon,
  FiGrid as GridIcon,
  FiPackage as PackageIcon,
  FiEye as EyeIcon,
  FiEyeOff as EyeOffIcon,
  FiMail as MailIcon,
  FiLock as LockIcon,
  FiHome as HomeIcon,
  FiCompass as CompassIcon,
  FiUsers as UsersIcon,
  FiShield as ShieldIcon,
  FiBarChart2 as BarChartIcon,
  FiClipboard as ClipboardIcon,
  FiMenu as MenuIcon,
} from 'react-icons/fi'

export { FaStar as StarFilledIcon, FaFire as FlameIcon } from 'react-icons/fa'

export const ChefHat = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
    <line x1="6" y1="17" x2="18" y2="17" />
  </svg>
)
