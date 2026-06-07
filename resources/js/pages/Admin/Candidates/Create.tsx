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

interface PageProps {
    seasons: ExamSeason[];
}

export default function Create({ seasons }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        exam_season_id: seasons.length > 0 ? seasons[0].id.toString() : '',
        file_no: '',
        name: '',
        telephone: '',
        email: '',
        gender: '',
        department: '',
        level: '',
        is_active: true,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/candidates');
    };

    return (
        <>
            <Head title="Add Candidate" />
            <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="mb-4 flex items-center gap-4">
                    <Link href="/admin/candidates">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Add Candidate
                        </h1>
                        <p className="text-muted-foreground">
                            Register a new candidate for an exam season.
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate Details</CardTitle>
                            <CardDescription>
                                Candidate password will be automatically
                                generated using their First Name and Last 4
                                digits of their Phone Number.
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
                                        placeholder="e.g. CAND-001"
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
                                        placeholder="John Doe"
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
                                        placeholder="+1234567890"
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
                                        placeholder="john@example.com"
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
                                        placeholder="e.g. Science"
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
                                        placeholder="e.g. Year 1"
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
                                {processing
                                    ? 'Creating...'
                                    : 'Create Candidate'}
                            </Button>
                        </CardFooter>
                    </Card>
                </form>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Candidates', href: '/admin/candidates' },
        { title: 'Add', href: '/admin/candidates/create' },
    ],
};
