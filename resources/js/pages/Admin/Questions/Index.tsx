import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Edit, Trash2, Upload, Download } from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';
import { Subject } from '@/types/exam';

interface Question {
    id: number;
    subject_id: number;
    subject?: Subject;
    question_text: string;
    question_type: string;
    marks: number;
    is_active: boolean;
    created_at: string;
}

interface PageProps {
    questions: {
        data: Question[];
        links: any[];
    };
    subjects: Subject[];
    filters: {
        subject_id?: string;
    };
}

export default function Index({ questions, subjects, filters }: PageProps) {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const handleFilterChange = (value: string) => {
        router.get('/admin/questions', { subject_id: value === 'all' ? '' : value }, { preserveState: true });
    };

    const handleImport = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/questions/import', {
            onSuccess: () => {
                setIsImportOpen(false);
                reset();
            },
        });
    };

    return (
        <>
            <Head title="Questions" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
                        <p className="text-muted-foreground">Manage exam questions for subjects.</p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" /> Bulk Import
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Import Questions</DialogTitle>
                                    <DialogDescription>
                                        Upload a CSV file to bulk import questions. <br/>
                                        <a href="/admin/questions/template" className="text-primary hover:underline font-medium inline-flex items-center mt-2">
                                            <Download className="mr-1 h-3 w-3" /> Download Template
                                        </a>
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleImport}>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="file">CSV File</Label>
                                            <Input
                                                id="file"
                                                type="file"
                                                accept=".csv"
                                                onChange={(e) => setData('file', e.target.files ? e.target.files[0] : null)}
                                            />
                                            {errors.file && <p className="text-sm font-medium text-destructive">{errors.file}</p>}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => setIsImportOpen(false)}>Cancel</Button>
                                        <Button type="submit" disabled={processing || !data.file}>Upload and Import</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Link href="/admin/questions/create">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Question
                            </Button>
                        </Link>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>All Questions</CardTitle>
                            <CardDescription>A list of all questions in the question bank.</CardDescription>
                        </div>
                        <div className="w-64">
                            <Select defaultValue={filters.subject_id || 'all'} onValueChange={handleFilterChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Subjects</SelectItem>
                                    {subjects.map((subject) => (
                                        <SelectItem key={subject.id} value={subject.id.toString()}>{subject.name} ({subject.code})</SelectItem>
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
                                        <TableHead className="w-16">ID</TableHead>
                                        <TableHead>Question Text</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Marks</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">
                                                No questions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        questions.data.map((question) => (
                                            <TableRow key={question.id}>
                                                <TableCell className="font-medium">#{question.id}</TableCell>
                                                <TableCell className="max-w-md truncate">
                                                    {question.question_text.replace(/(<([^>]+)>)/gi, "").substring(0, 80)}
                                                    {question.question_text.length > 80 ? '...' : ''}
                                                </TableCell>
                                                <TableCell>{question.subject?.code}</TableCell>
                                                <TableCell>{question.marks}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                                                        ${question.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {question.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link href={`/admin/questions/${question.id}/edit`}>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                        </Link>
                                                        <Link href={`/admin/questions/${question.id}`} method="delete" as="button"
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
        { title: 'Questions', href: '/admin/questions' },
    ],
};
