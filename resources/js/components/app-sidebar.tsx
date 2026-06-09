import { Link } from '@inertiajs/react';
import {
    BookOpen,
    FolderGit2,
    LayoutGrid,
    MonitorPlay,
    FileText,
    Users,
    Shield,
    Key,
    BarChart,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Live Monitor',
        href: '/admin/monitor',
        icon: MonitorPlay,
    },
    {
        title: 'Results',
        href: '/admin/results',
        icon: FileText,
    },
    {
        title: 'Exam Seasons',
        href: '/admin/exam-seasons',
        icon: BookOpen,
    },
    {
        title: 'Candidates',
        href: '/admin/candidates',
        icon: BookOpen,
    },
    {
        title: 'Subjects',
        href: '/admin/subjects',
        icon: BookOpen,
    },
    {
        title: 'Question Bank',
        href: '/admin/questions',
        icon: BookOpen,
    },
    {
        title: 'Reports',
        href: '/admin/reports',
        icon: BarChart,
    },
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Roles',
        href: '/admin/roles',
        icon: Shield,
    },
    {
        title: 'Permissions',
        href: '/admin/permissions',
        icon: Key,
    },
];

const footerNavItems: NavItem[] = [
   
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
