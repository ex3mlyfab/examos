import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { FormEvent } from 'react';
import { Subject } from '@/types/exam';

interface PageProps {
    subjects: Subject[];
}

export default function Create({ subjects }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        subject_id: subjects.length > 0 ? subjects[0].id.toString() : '',
        question_text: '',
        marks: 1,
        is_active: true,
        image: null as File | null,
        options: [
            { option_label: 'A', option_text: '', is_correct: true },
            { option_label: 'B', option_text: '', is_correct: false },
            { option_label: 'C', option_text: '', is_correct: false },
            { option_label: 'D', option_text: '', is_correct: false },
        ],
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/admin/questions', {
            forceFormData: true,
        });
    };

    const addOption = () => {
        const nextLabel = String.fromCharCode(65 + data.options.length); // A, B, C, D...
        setData('options', [...data.options, { option_label: nextLabel, option_text: '', is_correct: false }]);
    };

    const removeOption = (index: number) => {
        const newOptions = [...data.options];
        newOptions.splice(index, 1);
        setData('options', newOptions);
    };

    const setCorrectOption = (index: number) => {
        const newOptions = data.options.map((opt, i) => ({
            ...opt,
            is_correct: i === index
        }));
        setData('options', newOptions);
    };

    const updateOptionText = (index: number, text: string) => {
        const newOptions = [...data.options];
        newOptions[index].option_text = text;
        setData('options', newOptions);
    };

    return (
        <>
            <Head title="Add Question" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 max-w-5xl mx-auto w-full">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/admin/questions">
                        <Button variant="outline" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Add Question</h1>
                        <p className="text-muted-foreground">Add a new multiple-choice question to the bank.</p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question Text</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <Textarea
                                            id="question_text"
                                            placeholder="Type your question here..."
                                            value={data.question_text}
                                            onChange={e => setData('question_text', e.target.value)}
                                            rows={6}
                                            className="text-lg"
                                        />
                                        {errors.question_text && <p className="text-sm font-medium text-destructive">{errors.question_text}</p>}
                                    </div>

                                    <div className="space-y-2 mt-4">
                                        <Label htmlFor="image">Optional Image Attachments</Label>
                                        <Input
                                            id="image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setData('image', e.target.files ? e.target.files[0] : null)}
                                        />
                                        {errors.image && <p className="text-sm font-medium text-destructive">{errors.image}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <div>
                                        <CardTitle>Answer Options</CardTitle>
                                        <CardDescription>Provide options and mark the correct one.</CardDescription>
                                    </div>
                                    <Button type="button" variant="outline" size="sm" onClick={addOption}>
                                        <Plus className="h-4 w-4 mr-2" /> Add Option
                                    </Button>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    {data.options.map((option, index) => (
                                        <div key={index} className={`flex gap-3 items-start p-3 rounded-lg border ${option.is_correct ? 'border-primary bg-primary/5' : 'border-border'}`}>
                                            <div className="pt-2">
                                                <input 
                                                    type="radio" 
                                                    name="correct_option" 
                                                    checked={option.is_correct}
                                                    onChange={() => setCorrectOption(index)}
                                                    className="w-5 h-5 text-primary"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="font-bold text-base">Option {option.option_label}</Label>
                                                    {data.options.length > 2 && (
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeOption(index)} className="h-6 w-6 text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <Textarea 
                                                    value={option.option_text}
                                                    onChange={(e) => updateOptionText(index, e.target.value)}
                                                    placeholder={`Enter option ${option.option_label}...`}
                                                    rows={2}
                                                />
                                                {/* @ts-ignore */}
                                                {errors[`options.${index}.option_text`] && <p className="text-sm font-medium text-destructive">{errors[`options.${index}.option_text`]}</p>}
                                            </div>
                                        </div>
                                    ))}
                                    {typeof errors.options === 'string' && <p className="text-sm font-medium text-destructive">{errors.options}</p>}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Question Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="subject_id">Subject <span className="text-destructive">*</span></Label>
                                        <Select 
                                            value={data.subject_id} 
                                            onValueChange={(val) => setData('subject_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map((subject) => (
                                                    <SelectItem key={subject.id} value={subject.id.toString()}>{subject.name} ({subject.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject_id && <p className="text-sm font-medium text-destructive">{errors.subject_id}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="marks">Marks / Points <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="marks"
                                            type="number"
                                            min="1"
                                            value={data.marks}
                                            onChange={e => setData('marks', parseInt(e.target.value) || 0)}
                                        />
                                        {errors.marks && <p className="text-sm font-medium text-destructive">{errors.marks}</p>}
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Active Question</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Include in exams
                                            </p>
                                        </div>
                                        <Switch
                                            checked={data.is_active}
                                            onCheckedChange={(checked) => setData('is_active', checked)}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col gap-2 border-t pt-6 bg-muted/20">
                                    <Button type="submit" className="w-full" disabled={processing}>
                                        <Save className="h-4 w-4 mr-2" />
                                        {processing ? 'Saving...' : 'Save Question'}
                                    </Button>
                                    <Link href="/admin/questions" className="w-full">
                                        <Button type="button" variant="outline" className="w-full">Cancel</Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}

Create.layout = {
    breadcrumbs: [
        { title: 'Questions', href: '/admin/questions' },
        { title: 'Add Question', href: '/admin/questions/create' },
    ],
};
