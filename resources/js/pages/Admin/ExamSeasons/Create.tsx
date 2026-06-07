import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import { FormEvent } from 'react';

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        description: '',
        starts_at: '',
        ends_at: '',
        status: 'draft',
        allow_result_review: false,
        exam_mode: 'per_subject',
        combo_settings: {
            total_duration_minutes: 120
        }
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/exam-seasons');
    };

    return (
        <>
            <Head title="Create Exam Season" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 max-w-4xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/admin/exam-seasons">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create Exam Season</h1>
                        <p className="text-muted-foreground">Setup a new examination period.</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Season Details</CardTitle>
                            <CardDescription>Fill in the required information to create a new exam season.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Season Name <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. 2026 First Semester Examination"
                                        value={data.name}
                                        onChange={e => setData('name', e.target.value)}
                                        autoFocus
                                    />
                                    {errors.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="code">Season Code <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="code"
                                        placeholder="e.g. 2026-SEM-1"
                                        value={data.code}
                                        onChange={e => setData('code', e.target.value)}
                                    />
                                    {errors.code && <p className="text-sm font-medium text-destructive">{errors.code}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter additional details..."
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm font-medium text-destructive">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="starts_at">Start Date & Time (Optional)</Label>
                                    <Input
                                        id="starts_at"
                                        type="datetime-local"
                                        value={data.starts_at}
                                        onChange={e => setData('starts_at', e.target.value)}
                                    />
                                    {errors.starts_at && <p className="text-sm font-medium text-destructive">{errors.starts_at}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="ends_at">End Date & Time (Optional)</Label>
                                    <Input
                                        id="ends_at"
                                        type="datetime-local"
                                        value={data.ends_at}
                                        onChange={e => setData('ends_at', e.target.value)}
                                    />
                                    {errors.ends_at && <p className="text-sm font-medium text-destructive">{errors.ends_at}</p>}
                                </div>
                            </div>

                            <div className="space-y-4 rounded-lg border p-4 bg-muted/10">
                                <div className="space-y-2">
                                    <Label htmlFor="exam_mode">Exam Mode</Label>
                                    <Select 
                                        value={data.exam_mode} 
                                        onValueChange={(val) => setData('exam_mode', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Exam Mode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="per_subject">Per-Subject Exams</SelectItem>
                                            <SelectItem value="combined">Combined Subjects</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <p className="text-sm text-muted-foreground">
                                        {data.exam_mode === 'combined' 
                                            ? 'Candidates will take all allocated subjects together in a single sitting with a master timer.' 
                                            : 'Candidates will take exams on a strict per-subject basis with individual timers.'}
                                    </p>
                                </div>

                                {data.exam_mode === 'combined' && (
                                    <div className="space-y-2 pt-2 border-t">
                                        <Label htmlFor="total_duration_minutes">Global Combo Timer (Minutes) <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="total_duration_minutes"
                                            type="number"
                                            min="1"
                                            value={data.combo_settings.total_duration_minutes}
                                            onChange={e => setData('combo_settings', { ...data.combo_settings, total_duration_minutes: parseInt(e.target.value) || 0 })}
                                        />
                                        <p className="text-sm text-muted-foreground">The total time given to complete all subjects in the combination.</p>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(val) => setData('status', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="active">Active</SelectItem>
                                            <SelectItem value="completed">Completed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm font-medium text-destructive">{errors.status}</p>}
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Allow Result Review</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Candidates can view their scores after submission.
                                    </p>
                                </div>
                                <Switch
                                    checked={data.allow_result_review}
                                    onCheckedChange={(checked) => setData('allow_result_review', checked)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 border-t pt-6 bg-muted/20">
                            <Link href="/admin/exam-seasons">
                                <Button type="button" variant="ghost">Cancel</Button>
                            </Link>
                            <Button type="submit" disabled={processing}>
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Creating...' : 'Create Season'}
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
        { title: 'Exam Seasons', href: '/admin/exam-seasons' },
        { title: 'Create', href: '/admin/exam-seasons/create' },
    ],
};
