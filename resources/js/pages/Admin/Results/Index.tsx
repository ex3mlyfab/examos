import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface Subject {
    id: number;
    name: string;
    code: string;
}

interface ExamSession {
    id: number;
    subject_id: number;
    status: string;
    score: number;
    passed: boolean;
    completed_at: string | null;
}

interface Candidate {
    id: number;
    file_no: string;
    name: string;
    exam_sessions: ExamSession[];
}

interface Season {
    id: number;
    name: string;
    status: string;
}

interface PageProps {
    seasons: Season[];
    currentSeason: Season | null;
    subjects: Subject[];
    candidates: {
        data: Candidate[];
        links: any[];
    };
    filters: {
        search?: string;
        season_id?: string;
    };
}

export default function ResultsIndex({ seasons, currentSeason, subjects, candidates, filters }: PageProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/results', { search, season_id: currentSeason?.id }, { preserveState: true });
    };

    const handleSeasonChange = (value: string) => {
        router.get('/admin/results', { season_id: value });
    };

    const handleExport = () => {
        if (!currentSeason) return;
        window.location.href = `/admin/results/export?season_id=${currentSeason.id}`;
    };

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Head title="Results & Grading" />
            
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Results & Grading</h2>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleExport} disabled={!currentSeason} className="gap-2">
                        <Download className="h-4 w-4" />
                        Export to Excel
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Candidates Result Sheet</CardTitle>
                    <CardDescription>View scores and detailed scorecards for all candidates.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="w-full sm:w-[300px]">
                            <Select 
                                value={currentSeason?.id.toString() || ''} 
                                onValueChange={handleSeasonChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Exam Season" />
                                </SelectTrigger>
                                <SelectContent>
                                    {seasons.map(s => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.name} {s.status === 'active' ? '(Active)' : ''}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <form onSubmit={handleSearch} className="flex w-full sm:w-auto items-center space-x-2">
                            <Input
                                placeholder="Search Candidate File No / Name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full sm:w-[300px]"
                            />
                            <Button type="submit" variant="secondary" size="icon">
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>

                    {!currentSeason ? (
                        <div className="text-center py-10 text-muted-foreground">
                            Please select an Exam Season to view results.
                        </div>
                    ) : (
                        <div className="rounded-md border overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>File No</TableHead>
                                        <TableHead>Candidate</TableHead>
                                        {subjects.map(sub => (
                                            <TableHead key={sub.id} className="text-center">{sub.code}</TableHead>
                                        ))}
                                        <TableHead className="text-center">Overall</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={subjects.length + 3} className="h-24 text-center">
                                                No candidates found for this season.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        candidates.data.map(candidate => {
                                            let totalScore = 0;
                                            let completedCount = 0;
                                            let allPassed = true;

                                            return (
                                                <TableRow key={candidate.id}>
                                                    <TableCell className="font-medium">{candidate.file_no}</TableCell>
                                                    <TableCell>{candidate.name}</TableCell>
                                                    
                                                    {subjects.map(sub => {
                                                        const session = candidate.exam_sessions.find(s => s.subject_id === sub.id);
                                                        if (session && session.status === 'completed') {
                                                            totalScore += session.score;
                                                            completedCount++;
                                                            if (!session.passed) allPassed = false;
                                                        } else {
                                                            allPassed = false;
                                                        }

                                                        return (
                                                            <TableCell key={sub.id} className="text-center">
                                                                {session ? (
                                                                    <div className="flex flex-col items-center">
                                                                        <span className={`font-semibold ${session.passed ? 'text-green-600' : 'text-destructive'}`}>
                                                                            {session.score !== null ? `${Number(session.score).toFixed(1)}%` : 'TBD'}
                                                                        </span>
                                                                        <Link 
                                                                            href={`/admin/results/${session.id}`}
                                                                            className="text-xs text-primary hover:underline flex items-center mt-1"
                                                                        >
                                                                            View
                                                                        </Link>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">N/A</span>
                                                                )}
                                                            </TableCell>
                                                        );
                                                    })}

                                                    <TableCell className="text-center">
                                                        {completedCount === subjects.length && subjects.length > 0 ? (
                                                            <Badge variant={allPassed ? "default" : "destructive"} className={allPassed ? 'bg-green-600' : ''}>
                                                                {((totalScore / subjects.length)).toFixed(1)}%
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-xs text-muted-foreground">Incomplete</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

ResultsIndex.layout = (page: React.ReactNode) => {
    const AppLayout = require('@/layouts/app-layout').default;
    return (
        <AppLayout breadcrumbs={[{ title: 'Results', href: '/admin/results' }]}>
            {page}
        </AppLayout>
    );
};
