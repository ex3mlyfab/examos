import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, Upload, KeyRound, Download, Users } from 'lucide-react';
import { ExamSeason } from '@/types/exam';

interface Candidate {
    id: number;
    file_no: string;
    name: string;
    gender: string;
    department: string;
    level: string;
    exam_season_id: number;
    exam_season?: ExamSeason;
    is_active: boolean;
    raw_password?: string;
    created_at: string;
}

interface PageProps {
    candidates: {
        data: Candidate[];
        links: any[];
    };
    seasons: ExamSeason[];
    filters: {
        season_id?: string;
    };
}

export default function Index({ candidates, seasons, filters }: PageProps) {
    const handleFilterChange = (value: string) => {
        router.get('/admin/candidates', { season_id: value === 'all' ? '' : value }, { preserveState: true });
    };

    return (
        <>
            <Head title="Candidates" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
                        <p className="text-muted-foreground">Manage exam candidates and their login credentials.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/admin/candidates/create">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Candidate
                            </Button>
                        </Link>
                        <a href="/admin/candidates/template" download>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Download Template
                            </Button>
                        </a>
                        {/* A bulk upload button can be added here in the future */}
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" /> Bulk Upload
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>All Candidates</CardTitle>
                            <CardDescription>A list of all candidates registered in the system.</CardDescription>
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
                                        <TableHead>File No.</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Season</TableHead>
                                        <TableHead>Dept/Level</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {candidates.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-48 text-center bg-muted/10">
                                                <div className="flex flex-col items-center justify-center p-8 animate-fade-in">
                                                    <div className="rounded-full bg-primary/10 p-4 mb-4">
                                                        <Users className="h-8 w-8 text-primary" />
                                                    </div>
                                                    <h3 className="text-lg font-medium tracking-tight">No candidates found</h3>
                                                    <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-sm mx-auto">
                                                        There are no candidates matching your current filters, or you haven't added any candidates yet.
                                                    </p>
                                                    <Link href="/admin/candidates/create">
                                                        <Button variant="outline" className="shadow-sm">
                                                            <PlusCircle className="mr-2 h-4 w-4" /> Add Candidate
                                                        </Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        candidates.data.map((candidate) => (
                                            <TableRow key={candidate.id}>
                                                <TableCell className="font-medium">
                                                    {candidate.file_no}
                                                    {candidate.raw_password && (
                                                        <span className="block text-xs text-muted-foreground mt-1 flex items-center">
                                                            <KeyRound className="h-3 w-3 mr-1 inline" /> {candidate.raw_password}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>{candidate.name}</TableCell>
                                                <TableCell>{candidate.exam_season?.name || 'N/A'}</TableCell>
                                                <TableCell>
                                                    {candidate.department || 'N/A'} {candidate.level ? `(${candidate.level})` : ''}
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                                        ${candidate.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {candidate.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/admin/candidates/${candidate.id}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/candidates/${candidate.id}`} method="delete" as="button"
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
        {
            title: 'Candidates',
            href: '/admin/candidates',
        },
    ],
};
