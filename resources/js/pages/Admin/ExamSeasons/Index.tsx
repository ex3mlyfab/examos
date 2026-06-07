import { Head, Link } from '@inertiajs/react';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { ExamSeason } from '@/types/exam';

interface PageProps {
    seasons: {
        data: ExamSeason[];
        links: any[];
    };
}

export default function Index({ seasons }: PageProps) {
    return (
        <>
            <Head title="Exam Seasons" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Exam Seasons
                        </h1>
                        <p className="text-muted-foreground">
                            Manage the examination periods.
                        </p>
                    </div>
                    <Link href="/admin/exam-seasons/create">
                        <Button>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create
                            Season
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle>All Seasons</CardTitle>
                        <CardDescription>
                            A list of all exam seasons created in the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Starts At</TableHead>
                                        <TableHead>Ends At</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {seasons.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={5}
                                                className="h-24 text-center"
                                            >
                                                No results.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        seasons.data.map((season) => (
                                            <TableRow key={season.id}>
                                                <TableCell className="font-medium">
                                                    {season.name}
                                                </TableCell>
                                                <TableCell>
                                                    {season.starts_at
                                                        ? new Date(
                                                              season.starts_at,
                                                          ).toLocaleString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {season.ends_at
                                                        ? new Date(
                                                              season.ends_at,
                                                          ).toLocaleString()
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                                                            season.status ===
                                                            'active'
                                                                ? 'bg-green-100 text-green-800'
                                                                : season.status ===
                                                                    'completed'
                                                                  ? 'bg-gray-100 text-gray-800'
                                                                  : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                    >
                                                        {season.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={`/admin/exam-seasons/${season.id}/edit`}
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
                                                            href={`/admin/exam-seasons/${season.id}`}
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
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Index.layout = {
    breadcrumbs: [
        {
            title: 'Exam Seasons',
            href: '/admin/exam-seasons',
        },
    ],
};
