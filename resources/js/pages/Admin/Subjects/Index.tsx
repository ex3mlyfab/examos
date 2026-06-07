import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ExamSeason } from '@/types/exam';

interface Subject {
    id: number;
    name: string;
    code: string;
    exam_season_id: number;
    exam_season?: ExamSeason;
    duration_minutes: number;
    questions_per_page: number;
    total_questions_to_display: number;
    pass_mark: number;
    is_active: boolean;
    created_at: string;
}

interface PageProps {
    subjects: {
        data: Subject[];
        links: any[];
    };
    seasons: ExamSeason[];
    filters: {
        season_id?: string;
    };
}

export default function Index({ subjects, seasons, filters }: PageProps) {
    const handleFilterChange = (value: string) => {
        router.get('/admin/subjects', { season_id: value === 'all' ? '' : value }, { preserveState: true });
    };

    return (
        <>
            <Head title="Subjects" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
                        <p className="text-muted-foreground">Manage examination subjects and settings.</p>
                    </div>
                    <Link href="/admin/subjects/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Subject
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>All Subjects</CardTitle>
                            <CardDescription>A list of all subjects allocated across exam seasons.</CardDescription>
                        </div>
                        <div className="w-64">
                            <Select defaultValue={filters.season_id || 'all'} onValueChange={handleFilterChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Season" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Seasons</SelectItem>
                                    {seasons.map((season) => (
                                        <SelectItem key={season.id} value={season.id.toString()}>{season.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Subject Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Season</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Qts to Answer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {subjects.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                No subjects found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        subjects.data.map((subject) => (
                                            <TableRow key={subject.id}>
                                                <TableCell className="font-medium">{subject.code}</TableCell>
                                                <TableCell>{subject.name}</TableCell>
                                                <TableCell>{subject.exam_season?.name || 'N/A'}</TableCell>
                                                <TableCell>{subject.duration_minutes} mins</TableCell>
                                                <TableCell>{subject.total_questions_to_display}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                                        ${subject.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {subject.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/admin/subjects/${subject.id}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/subjects/${subject.id}`} method="delete" as="button"
                                                              className="text-destructive hover:text-destructive/90">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        { title: 'Subjects', href: '/admin/subjects' },
    ],
};
