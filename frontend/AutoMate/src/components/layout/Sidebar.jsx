import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Users,
  Car,
  Wrench,
  FileText,
  Settings,
  BarChart3,
  UserCog,
  ClipboardList,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

/**
 * Navigation menu items based on user roles
 */
const getMenuItems = (userRole) => {
  const menuItems = {
    admin: [
      {
        name: 'Dashboard',
        href: '/admin/dashboard',
        icon: Home,
        description: 'System overview and statistics'
      },
      {
        name: 'User Management',
        href: '/admin/users',
        icon: Users,
        description: 'Manage system users and roles'
      },
      {
        name: 'Vehicle Management',
        href: '/admin/vehicles',
        icon: Car,
        description: 'Manage all vehicles in the system'
      },
      {
        name: 'Owner Management',
        href: '/admin/owners',
        icon: UserCog,
        description: 'Manage vehicle owners'
      },
      {
        name: 'Service Management',
        href: '/admin/services',
        icon: Settings,
        description: 'Define and manage repair services'
      },
      {
        name: 'Maintenance Management',
        href: '/admin/maintenance-management',
        icon: Wrench,
        description: 'Manage maintenance logs with full CRUD operations'
      },
      {
        name: 'Maintenance Logs',
        href: '/admin/maintenance',
        icon: ClipboardList,
        description: 'View all maintenance records'
      },
      {
        name: 'Reports',
        href: '/admin/reports',
        icon: BarChart3,
        description: 'System reports and analytics'
      }
    ],
    mechanic: [
      {
        name: 'Dashboard',
        href: '/mechanic/dashboard',
        icon: Home,
        description: 'Your work queue and activities'
      },
      {
        name: 'Vehicles',
        href: '/mechanic/vehicles',
        icon: Car,
        description: 'Search and manage vehicles'
      },
      {
        name: 'Maintenance Logs',
        href: '/mechanic/maintenance',
        icon: Wrench,
        description: 'Create and view maintenance records'
      },
      {
        name: 'Invoices',
        href: '/mechanic/invoices',
        icon: Receipt,
        description: 'Generate and manage invoices'
      }
    ],
    customer: [
      {
        name: 'Dashboard',
        href: '/customer/dashboard',
        icon: Home,
        description: 'Your vehicles overview'
      },
      {
        name: 'My Vehicles',
        href: '/customer/vehicles',
        icon: Car,
        description: 'View your vehicles and their status'
      },
      {
        name: 'Maintenance History',
        href: '/customer/maintenance',
        icon: FileText,
        description: 'View maintenance records for your vehicles'
      },
      {
        name: 'Invoices',
        href: '/customer/invoices',
        icon: Receipt,
        description: 'View and print your invoices'
      }
    ]
  };

  return menuItems[userRole] || [];
};

/**
 * Sidebar component with role-based navigation
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether sidebar is open (for mobile)
 * @param {Function} props.onClose - Function to close sidebar (for mobile)
 */
const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = getMenuItems(user?.role);

  const isActiveLink = (href) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col
      `}>
        {/* Sidebar header */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Navigation
          </h2>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveLink(item.href);

            return (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={onClose} // Close mobile menu when link is clicked
                className={`
                  flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-200'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                  }
                `}
                title={item.description}
              >
                <Icon className={`
                  h-5 w-5 mr-3 flex-shrink-0
                  ${isActive
                    ? 'text-blue-600 dark:text-blue-300'
                    : 'text-gray-500 dark:text-gray-400'
                  }
                `} />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.user_name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
            <div className="ml-3 min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.user_name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;