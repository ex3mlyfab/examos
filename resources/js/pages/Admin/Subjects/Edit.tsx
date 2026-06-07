import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';
import { ExamSeason } from '@/types/exam';

interface Subject {
    id: number;
    name: string;
    code: string;
    exam_season_id: number;
    duration_minutes: number;
    questions_per_page: number;
    total_questions_to_display: number;
    pass_mark: number;
    instructions: string | null;
    is_active: boolean;
}

interface PageProps {
    subject: Subject;
    seasons: ExamSeason[];
}

export default function Edit({ subject, seasons }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        exam_season_id: subject.exam_season_id ? subject.exam_season_id.toString() : '',
        name: subject.name || '',
        code: subject.code || '',
        duration_minutes: subject.duration_minutes || 60,
        total_questions_to_display: subject.total_questions_to_display || 50,
        pass_mark: subject.pass_mark || 50,
        instructions: subject.instructions || '',
        is_active: subject.is_active,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/admin/subjects/${subject.id}`);
    };

    return (
        <>
            <Head title={`Edit ${subject.name}`} />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/admin/subjects">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Subject</h1>
                        <p className="text-muted-foreground">Modify subject and exam configurations.</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Subject Configuration</CardTitle>
                            <CardDescription>
                                Set the subject identity, duration, and exam parameters for this subject.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="exam_season_id">Exam Season <span className="text-destructive">*</span></Label>
                                <Select 
                                    value={data.exam_season_id} 
                                    onValueChange={(val) => setData('exam_season_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Exam Season" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {seasons.map((season) => (
                                            <SelectItem key={season.id} value={season.id.toString()}>{season.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.exam_season_id && <p className="text-sm font-medium text-destructive">{errors.exam_season_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Subject Code <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                        autoFocus
                                    />
                                    {errors.code && <p className="text-sm font-medium text-destructive">{errors.code}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Subject Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                    />
                                    {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="duration_minutes">Duration (Mins) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="duration_minutes"
                                        type="number"
                                        min="1"
                                        value={data.duration_minutes}
                                        onChange={e => setData('duration_minutes', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.duration_minutes && <p className="text-sm font-medium text-destructive">{errors.duration_minutes}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="total_questions_to_display">Total Qs <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="total_questions_to_display"
                                        type="number"
                                        min="1"
                                        value={data.total_questions_to_display}
                                        onChange={e => setData('total_questions_to_display', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.total_questions_to_display && <p className="text-sm font-medium text-destructive">{errors.total_questions_to_display}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="pass_mark">Pass Mark (%) <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="pass_mark"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={data.pass_mark}
                                        onChange={e => setData('pass_mark', parseInt(e.target.value) || 0)}
                                    />
                                    {errors.pass_mark && <p className="text-sm font-medium text-destructive">{errors.pass_mark}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="instructions">Subject Instructions</Label>
                                <Textarea
                                    id="instructions"
                                    placeholder="Enter instructions that candidates will see before starting this subject..."
                                    value={data.instructions}
                                    onChange={e => setData('instructions', e.target.value)}
                                    rows={4}
                                />
                                {errors.instructions && <p className="text-sm font-medium text-destructive">{errors.instructions}</p>}
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Active Subject</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Candidates can take exams for this subject when active.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t pt-6 bg-muted/20">
                            <Link href="/admin/subjects">
                                <Button type="button" variant="ghost">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
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
        { title: 'Subjects', href: '/admin/subjects' },
        { title: 'Edit Subject', href: '#' },
    ],
};
