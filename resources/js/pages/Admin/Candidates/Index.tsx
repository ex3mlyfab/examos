import { Head, Link, router } from '@inertiajs/react';
import { PlusCircle, Edit, Trash2, Upload, KeyRound, Download, Users, Printer, List } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ExamSeason } from '@/types/exam';

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
    const [viewMode, setViewMode] = useState<'table' | 'print'>('table');

    const handleFilterChange = (value: string) => {
        router.get('/admin/candidates', { season_id: value === 'all' ? '' : value }, { preserveState: true });
    };

    return (
        <>
            <Head title="Candidates" />
            
            {viewMode === 'print' && (
                <style dangerouslySetInnerHTML={{__html: `
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #printable-area, #printable-area * {
                            visibility: visible;
                        }
                        #printable-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 80mm;
                            margin: 0;
                            padding: 0;
                        }
                        .print-card {
                            page-break-inside: avoid;
                            margin-bottom: 20px;
                            padding-bottom: 20px;
                            border-bottom: 1px dashed #000;
                            font-family: monospace;
                        }
                    }
                `}} />
            )}

            <div className={`flex h-full flex-1 flex-col gap-4 rounded-xl p-4 ${viewMode === 'table' ? 'overflow-x-auto' : ''}`}>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Candidates</h1>
                        <p className="text-muted-foreground">Manage exam candidates and their login credentials.</p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Button 
                            variant="secondary" 
                            onClick={() => setViewMode(viewMode === 'table' ? 'print' : 'table')}
                            className={viewMode === 'print' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}
                        >
                            {viewMode === 'table' ? (
                                <><Printer className="mr-2 h-4 w-4" /> Print View</>
                            ) : (
                                <><List className="mr-2 h-4 w-4" /> Table View</>
                            )}
                        </Button>
                        {viewMode === 'print' && (
                            <Button onClick={() => window.print()} className="bg-green-600 hover:bg-green-700 text-white">
                                <Printer className="mr-2 h-4 w-4" /> Print Now
                            </Button>
                        )}
                        <Link href="/admin/candidates/create">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Candidate
                            </Button>
                        </Link>
                        <a href="/admin/candidates/template" download>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Template
                            </Button>
                        </a>
                        <Button variant="outline">
                            <Upload className="mr-2 h-4 w-4" /> Upload
                        </Button>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <Card>
                        <CardHeader className="pb-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>All Candidates</CardTitle>
                                <CardDescription>A list of all candidates registered in the system.</CardDescription>
                            </div>
                            <div className="w-full sm:w-64">
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
                            <div className="rounded-md border overflow-x-auto">
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
                ) : (
                    <div className="bg-white rounded-xl border p-4 sm:p-8">
                        <div className="mb-6 pb-6 border-b print:hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">Thermal Print View</h2>
                                <p className="text-muted-foreground text-sm">
                                    Format optimized for 58mm/80mm thermal receipt printers. 
                                    Click <strong>Print Now</strong> and select your thermal printer.
                                </p>
                            </div>
                            <div className="w-full sm:w-64">
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
                        </div>

                        {candidates.data.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground print:hidden">
                                No candidates to print.
                            </div>
                        ) : (
                            <div id="printable-area" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 print:block print:w-full">
                                {candidates.data.map((candidate) => (
                                    <div key={candidate.id} className="print-card bg-zinc-50 dark:bg-zinc-900 border rounded-lg p-5 print:bg-transparent print:border-none print:p-2 print:rounded-none">
                                        <div className="text-center mb-4">
                                            <h3 className="font-bold text-lg leading-tight uppercase tracking-wide">{candidate.name}</h3>
                                            <p className="text-sm text-zinc-500 mt-1 uppercase">
                                                {candidate.department || 'N/A'} {candidate.level ? `(${candidate.level})` : ''}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-3 bg-white dark:bg-zinc-800 p-4 rounded border print:bg-transparent print:border-y print:border-x-0 print:border-black print:border-dashed print:p-2 print:rounded-none">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Login ID</span>
                                                <span className="font-mono text-base font-medium">{candidate.file_no}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Password</span>
                                                <span className="font-mono text-lg font-bold">{candidate.raw_password || '******'}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="text-center mt-4 text-xs text-zinc-400 print:text-black">
                                            Keep these details secure
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
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
