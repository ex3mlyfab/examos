import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, CheckCircle2, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SubjectStat {
    name: string;
    total_attempts: number;
    passed: number;
    total_score_percentage: number;
    average_score: number;
    pass_rate: number;
}

interface ReportsProps {
    totalSessions: number;
    overallPassRate: number;
    subjectStats: SubjectStat[];
}

export default function ReportsIndex({ totalSessions, overallPassRate, subjectStats }: ReportsProps) {
    return (
        <>
            <Head title="Exam Reports & Analytics" />
            
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Exam Reports & Analytics</h1>
                        <p className="text-muted-foreground mt-1">Analyze candidate performance across all subjects and seasons.</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="bg-card shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Completed Exams</CardTitle>
                            <BarChart className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalSessions}</div>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-card shadow-sm border-border">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Pass Rate</CardTitle>
                            <TrendingUp className="h-4 w-4 text-[oklch(0.52_0.10_185)]" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{overallPassRate}%</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-4">
                    <CardHeader>
                        <CardTitle>Subject Performance Breakdown</CardTitle>
                        <CardDescription>Average scores and pass rates per subject</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {subjectStats.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Subject Name</TableHead>
                                            <TableHead className="text-right">Total Attempts</TableHead>
                                            <TableHead className="text-right">Avg. Score</TableHead>
                                            <TableHead className="text-right">Pass Rate</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {subjectStats.map((stat, i) => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">{stat.name}</TableCell>
                                                <TableCell className="text-right">{stat.total_attempts}</TableCell>
                                                <TableCell className="text-right">{stat.average_score}%</TableCell>
                                                <TableCell className="text-right">{stat.pass_rate}%</TableCell>
                                                <TableCell className="text-right">
                                                    {stat.pass_rate >= 50 ? (
                                                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Healthy</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">Needs Review</Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="flex h-32 items-center justify-center rounded-md border border-dashed">
                                <p className="text-muted-foreground">No exam data available yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
