import { Head } from '@inertiajs/react';
import { dashboard } from '@/routes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Layers, Target } from 'lucide-react';

interface DashboardProps {
    stats: {
        totalCandidates: number;
        activeSeasons: number;
        totalSubjects: number;
        totalQuestions: number;
    };
}

export default function Dashboard({ stats }: DashboardProps) {
    return (
        <>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
                <h1 className="text-3xl font-bold tracking-tight mb-4">Dashboard Overview</h1>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-card shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
                            <Users className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalCandidates ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Active Seasons</CardTitle>
                            <Target className="h-4 w-4 text-[oklch(0.52_0.10_185)]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.activeSeasons ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Subjects</CardTitle>
                            <BookOpen className="h-4 w-4 text-[oklch(0.72_0.16_60)]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalSubjects ?? 0}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
                            <Layers className="h-4 w-4 text-sidebar-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.totalQuestions ?? 0}</div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Additional dashboard content could go here, like a welcome banner or recent activity */}
                <Card className="mt-4 border-sidebar-border bg-sidebar/10">
                    <CardHeader>
                        <CardTitle>Welcome to Examos Admin</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            Use the sidebar to navigate through exam seasons, candidates, question banks, and system settings.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
