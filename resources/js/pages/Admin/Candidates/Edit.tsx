import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { ExamSeason } from '@/types/exam';

interface Candidate {
    id: number;
    file_no: string;
    name: string;
    telephone: string;
    email: string;
    gender: string;
    department: string;
    level: string;
    exam_season_id: number;
    is_active: boolean;
}

interface PageProps {
    candidate: Candidate;
    seasons: ExamSeason[];
}

export default function Edit({ candidate, seasons }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        exam_season_id: candidate.exam_season_id
            ? candidate.exam_season_id.toString()
            : '',
        file_no: candidate.file_no || '',
        name: candidate.name || '',
        telephone: candidate.telephone || '',
        email: candidate.email || '',
        gender: candidate.gender || '',
        department: candidate.department || '',
        level: candidate.level || '',
        is_active: candidate.is_active,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/candidates/${candidate.id}`);
    };

    return (
        <>
            <Head title={`Edit ${candidate.name}`} />
            <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center gap-4">
                    <Link href="/admin/candidates">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Edit Candidate
                        </h1>
                        <p className="text-muted-foreground">
                            Modify candidate details.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate Details</CardTitle>
                            <CardDescription>
                                Update the candidate's personal and academic
                                information. Note that editing names/phones does
                                not reset the automatically generated password.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="exam_season_id">
                                    Exam Season{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={data.exam_season_id}
                                    onValueChange={(val) =>
                                        setData('exam_season_id', val)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Exam Season" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {seasons.map((season) => (
                                            <SelectItem
                                                key={season.id}
                                                value={season.id.toString()}
                                            >
                                                {season.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.exam_season_id && (
                                    <p className="text-sm font-medium text-destructive">
                                        {errors.exam_season_id}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="file_no">
                                        File Number (Username){' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="file_no"
                                        value={data.file_no}
                                        onChange={(e) =>
                                            setData('file_no', e.target.value)
                                        }
                                        autoFocus
                                    />
                                    {errors.file_no && (
                                        <p className="text-sm font-medium text-destructive">
                                            {errors.file_no}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">
                                        Full Name{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) =>
                                            setData('name', e.target.value)
                                        }
                                    />
                                    {errors.name && (
                                        <p className="text-sm font-medium text-destructive">
                                            {errors.name}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="telephone">Telephone</Label>
                                    <Input
                                        id="telephone"
                                        value={data.telephone}
                                        onChange={(e) =>
                                            setData('telephone', e.target.value)
                                        }
                                    />
                                    {errors.telephone && (
                                        <p className="text-sm font-medium text-destructive">
                                            {errors.telephone}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData('email', e.target.value)
                                        }
                                    />
                                    {errors.email && (
                                        <p className="text-sm font-medium text-destructive">
                                            {errors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        value={data.gender}
                                        onValueChange={(val) =>
                                            setData('gender', val)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="M">
                                                Male
                                            </SelectItem>
                                            <SelectItem value="F">
                                                Female
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.gender && (
                                        <p className="text-sm font-medium text-destructive">
                                            {errors.gender}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="department">
                                        Department
                                    </Label>
                                    <Input
                                        id="department"
                                        value={data.department}
                                        onChange={(e) =>
                                            setData(
                                                'department',
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {errors.department && (
                                        <p className="text-sm font-medium text-destructive">
                                            {errors.department}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="level">Level/Grade</Label>
                                    <Input
                                        id="level"
                                        value={data.level}
                                        onChange={(e) =>
                                            setData('level', e.target.value)
                                        }
                                    />
                                    {errors.level && (
                                        <p className="text-sm font-medium text-destructive">
                                            {errors.level}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">
                                        Active Account
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Active candidates can log in to the
                                        portal and take exams.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(checked) =>
                                        setData('is_active', checked)
                                    }
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t bg-muted/20 pt-6">
                            <Link href="/admin/candidates">
                                <Button type="button" variant="ghost">
                                    Cancel
                                </Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="mr-2 h-4 w-4" />
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    );
}

Edit.layout = {
    breadcrumbs: [
        { title: 'Candidates', href: '/admin/candidates' },
        { title: 'Edit', href: '#' },
    ],
};
