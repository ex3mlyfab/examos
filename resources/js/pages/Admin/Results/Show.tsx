import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, X, FileText, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface Option {
    id: number;
    option_text: string;
    option_label: string;
    is_correct: boolean;
}

interface Question {
    id: number;
    question_text: string;
    marks: number;
    options: Option[];
}

interface Answer {
    id: number;
    question_id: number;
    selected_option_id: number | null;
    is_correct: boolean;
    is_flagged: boolean;
    question: Question;
    selected_option: Option | null;
}

interface Session {
    id: number;
    status: string;
    score: number;
    passed: boolean;
    completed_at: string;
    candidate: {
        id: number;
        name: string;
        file_no: string;
    };
    subject: {
        id: number;
        name: string;
        code: string;
        pass_mark: number;
    };
    answers: Answer[];
}

interface PageProps {
    session: Session;
}

export default function ResultsShow({ session }: PageProps) {
    const totalMarks = session.answers.reduce((acc, ans) => acc + ans.question.marks, 0);
    const earnedMarks = session.answers.filter(a => a.is_correct).reduce((acc, ans) => acc + ans.question.marks, 0);
    
    const correctCount = session.answers.filter(a => a.is_correct).length;
    const incorrectCount = session.answers.filter(a => !a.is_correct && a.selected_option_id !== null).length;
    const unansweredCount = session.answers.filter(a => a.selected_option_id === null).length;

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <Head title={`Scorecard - ${session.candidate.name}`} />
            
            <div className="flex items-center space-x-4 mb-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/results">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Candidate Scorecard</h2>
                    <p className="text-muted-foreground">Detailed breakdown of exam performance.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Candidate Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium text-lg">{session.candidate.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">File Number</p>
                                <p className="font-medium text-lg">{session.candidate.file_no}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Subject</p>
                                <p className="font-medium">{session.subject.name} ({session.subject.code})</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Completed At</p>
                                <p className="font-medium">{new Date(session.completed_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-1">
                    <CardHeader>
                        <CardTitle>Score Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="text-center">
                            <span className={`text-5xl font-bold ${session.passed ? 'text-green-600' : 'text-destructive'}`}>
                                {Number(session.score).toFixed(1)}%
                            </span>
                        </div>
                        <Badge variant={session.passed ? 'default' : 'destructive'} className={`text-sm px-4 py-1 ${session.passed ? 'bg-green-600' : ''}`}>
                            {session.passed ? 'PASSED' : 'FAILED'}
                        </Badge>
                        <div className="w-full space-y-1 mt-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Raw Score:</span>
                                <span>{earnedMarks} / {totalMarks} Marks</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Correct:</span>
                                <span className="text-green-600">{correctCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Incorrect:</span>
                                <span className="text-destructive">{incorrectCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Unanswered:</span>
                                <span>{unansweredCount}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Pass Mark Required:</span>
                                <span>{session.subject.pass_mark}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Question Breakdown
                    </CardTitle>
                    <CardDescription>Review answers submitted by the candidate</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {session.answers.map((answer, index) => {
                        const correctOption = answer.question.options.find(o => o.is_correct);
                        
                        return (
                            <div key={answer.id} className="border rounded-lg p-4 bg-muted/20">
                                <div className="flex justify-between items-start gap-4 mb-4">
                                    <div>
                                        <h4 className="font-semibold text-lg flex items-start gap-2">
                                            <span className="text-muted-foreground w-6 shrink-0">{index + 1}.</span>
                                            <span dangerouslySetInnerHTML={{ __html: answer.question.question_text }} />
                                        </h4>
                                    </div>
                                    <Badge variant={answer.is_correct ? 'default' : 'destructive'} className={answer.is_correct ? 'bg-green-600' : ''}>
                                        {answer.is_correct ? 'Correct' : 'Incorrect'} ({answer.is_correct ? answer.question.marks : 0}/{answer.question.marks} marks)
                                    </Badge>
                                </div>

                                <div className="ml-8 space-y-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-3 rounded-md bg-background border">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Candidate's Answer:</p>
                                            <div className="flex items-center gap-2">
                                                {answer.selected_option ? (
                                                    <>
                                                        {answer.is_correct ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-destructive" />
                                                        )}
                                                        <span dangerouslySetInnerHTML={{ __html: `<strong>${answer.selected_option.option_label}.</strong> ${answer.selected_option.option_text}` }} />
                                                    </>
                                                ) : (
                                                    <span className="italic text-muted-foreground">Did not answer</span>
                                                )}
                                            </div>
                                        </div>

                                        {!answer.is_correct && correctOption && (
                                            <div className="p-3 rounded-md bg-green-50 border border-green-200 dark:bg-green-950/20 dark:border-green-900">
                                                <p className="text-xs text-green-700 dark:text-green-400 uppercase font-bold mb-1">Correct Answer:</p>
                                                <div className="flex items-center gap-2">
                                                    <Check className="h-4 w-4 text-green-600" />
                                                    <span dangerouslySetInnerHTML={{ __html: `<strong>${correctOption.option_label}.</strong> ${correctOption.option_text}` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </CardContent>
            </Card>
        </div>
    );
}

ResultsShow.layout = (page: React.ReactNode) => {
    const AppLayout = require('@/layouts/app-layout').default;
    return (
        <AppLayout breadcrumbs={[
            { title: 'Results', href: '/admin/results' },
            { title: 'Scorecard', href: '#' }
        ]}>
            {page}
        </AppLayout>
    );
};
