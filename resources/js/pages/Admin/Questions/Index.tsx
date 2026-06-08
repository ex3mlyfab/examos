import { Head, Link, router } from '@inertiajs/react';
import { useForm } from '@inertiajs/react';
import { PlusCircle, Edit, Trash2, Upload, Download, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Pagination from '@/components/Pagination';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Subject } from '@/types/exam';

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
        from?: number;
        to?: number;
        total?: number;
    };
    subjects: Subject[];
    filters: {
        subject_id?: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
}

export default function Index({ questions, subjects, filters, stats }: PageProps) {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        file: null as File | null,
    });

    const handleFilterChange = (value: string) => {
        router.get(
            '/admin/questions',
            { subject_id: value === 'all' ? '' : value },
            { preserveState: true },
        );
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
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Question Bank
                        </h1>
                        <p className="text-muted-foreground">
                            Manage exam questions for subjects.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Dialog
                            open={isImportOpen}
                            onOpenChange={setIsImportOpen}
                        >
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" /> Bulk
                                    Import
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Import Questions</DialogTitle>
                                    <DialogDescription>
                                        Upload a CSV file to bulk import
                                        questions. <br />
                                        <a
                                            href="/admin/questions/template"
                                            className="mt-2 inline-flex items-center font-medium text-primary hover:underline"
                                        >
                                            <Download className="mr-1 h-3 w-3" />{' '}
                                            Download Template
                                        </a>
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleImport}>
                                    <div className="grid gap-4 py-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="file">
                                                CSV File
                                            </Label>
                                            <Input
                                                id="file"
                                                type="file"
                                                accept=".csv"
                                                onChange={(e) =>
                                                    setData(
                                                        'file',
                                                        e.target.files
                                                            ? e.target.files[0]
                                                            : null,
                                                    )
                                                }
                                            />
                                            {errors.file && (
                                                <p className="text-sm font-medium text-destructive">
                                                    {errors.file}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() =>
                                                setIsImportOpen(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing || !data.file}
                                        >
                                            Upload and Import
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                        <Link href="/admin/questions/create">
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add
                                Question
                            </Button>
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-indigo-50/50 to-white dark:from-zinc-900 dark:to-zinc-950">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
                            <Database className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stats.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">Questions in the bank</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50/50 to-white dark:from-zinc-900 dark:to-zinc-950">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Active Questions</CardTitle>
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">{stats.active}</div>
                            <p className="text-xs text-muted-foreground mt-1">Available for exams</p>
                        </CardContent>
                    </Card>

                    <Card className="relative overflow-hidden bg-gradient-to-br from-amber-50/50 to-white dark:from-zinc-900 dark:to-zinc-950">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium">Inactive Questions</CardTitle>
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{stats.inactive}</div>
                            <p className="text-xs text-muted-foreground mt-1">Draft or disabled</p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <div>
                            <CardTitle>All Questions</CardTitle>
                            <CardDescription>
                                A list of all questions in the question bank.
                            </CardDescription>
                        </div>
                        <div className="w-64">
                            <Select
                                defaultValue={filters.subject_id || 'all'}
                                onValueChange={handleFilterChange}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Filter by Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All Subjects
                                    </SelectItem>
                                    {subjects.map((subject) => (
                                        <SelectItem
                                            key={subject.id}
                                            value={subject.id.toString()}
                                        >
                                            {subject.name} ({subject.code})
                                        </SelectItem>
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
                                        <TableHead className="w-16">
                                            ID
                                        </TableHead>
                                        <TableHead>Question Text</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Marks</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {questions.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="h-24 text-center"
                                            >
                                                No questions found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        questions.data.map((question) => (
                                            <TableRow key={question.id}>
                                                <TableCell className="font-medium">
                                                    #{question.id}
                                                </TableCell>
                                                <TableCell className="max-w-md truncate">
                                                    {question.question_text
                                                        .replace(
                                                            /(<([^>]+)>)/gi,
                                                            '',
                                                        )
                                                        .substring(0, 80)}
                                                    {question.question_text
                                                        .length > 80
                                                        ? '...'
                                                        : ''}
                                                </TableCell>
                                                <TableCell>
                                                    {question.subject?.code}
                                                </TableCell>
                                                <TableCell>
                                                    {question.marks}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${question.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                                    >
                                                        {question.is_active
                                                            ? 'Active'
                                                            : 'Inactive'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/admin/questions/${question.id}/edit`}
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Edit
                                                                </span>
                                                            </Button>
                                                        </Link>
                                                        <Link
                                                            href={`/admin/questions/${question.id}`}
                                                            method="delete"
                                                            as="button"
                                                            className="text-destructive hover:text-destructive/90"
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">
                                                                    Delete
                                                                </span>
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
                        <div className="mt-4">
                            <Pagination
                                links={questions.links}
                                from={questions.from}
                                to={questions.to}
                                total={questions.total}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [{ title: 'Questions', href: '/admin/questions' }],
};
