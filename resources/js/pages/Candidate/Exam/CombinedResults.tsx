import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Check,
    X,
    FileText,
    BookOpen,
    Clock,
    Award,
    CheckCircle2,
    XCircle,
    ChevronLeft,
} from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import type { CandidateExamSession, ExamSeason } from '@/types/exam';

interface Props {
    season: ExamSeason;
    sessions: any[];
}

export default function CombinedResults({ season, sessions }: Props) {
    const [activeSubjectId, setActiveSubjectId] = useState<number>(
        sessions[0]?.subject_id || 0,
    );

    // Calculate overall stats
    const totalMarks = sessions.reduce((acc, s) => {
        const sessionMarks = s.answers?.reduce(
            (sum: number, ans: any) => sum + (ans.question?.marks || 0),
            0,
        ) || 0;
        return acc + sessionMarks;
    }, 0);

    const earnedMarks = sessions.reduce((acc, s) => {
        const sessionEarned = s.answers
            ?.filter((ans: any) => ans.is_correct)
            .reduce((sum: number, ans: any) => sum + (ans.question?.marks || 0),
                0,
            ) || 0;
        return acc + sessionEarned;
    }, 0);

    const overallPercentage = totalMarks > 0 ? (earnedMarks / totalMarks) * 100 : 0;
    const allPassed = sessions.every((s) => s.passed);

    const totalQuestions = sessions.reduce(
        (acc, s) => acc + (s.answers?.length || 0),
        0,
    );
    const totalCorrect = sessions.reduce(
        (acc, s) => acc + (s.answers?.filter((ans: any) => ans.is_correct).length || 0),
        0,
    );
    const totalIncorrect = sessions.reduce(
        (acc, s) =>
            acc +
            (s.answers?.filter(
                (ans: any) => !ans.is_correct && ans.selected_option_id !== null,
            ).length || 0),
        0,
    );
    const totalUnanswered = sessions.reduce(
        (acc, s) =>
            acc +
            (s.answers?.filter((ans: any) => ans.selected_option_id === null).length ||
                0),
        0,
    );

    // Get active subject session
    const activeSession = sessions.find((s) => s.subject_id === activeSubjectId) || sessions[0];
    const activeSubject = activeSession?.subject;
    const activeAnswers = activeSession?.answers || [];

    // Active subject stats
    const activeTotalMarks = activeAnswers.reduce(
        (acc: number, ans: any) => acc + (ans.question?.marks || 0),
        0,
    );
    const activeEarnedMarks = activeAnswers
        .filter((ans: any) => ans.is_correct)
        .reduce((acc: number, ans: any) => acc + (ans.question?.marks || 0), 0);

    const activeCorrect = activeAnswers.filter((ans: any) => ans.is_correct).length;
    const activeIncorrect = activeAnswers.filter(
        (ans: any) => !ans.is_correct && ans.selected_option_id !== null,
    ).length;
    const activeUnanswered = activeAnswers.filter(
        (ans: any) => ans.selected_option_id === null,
    ).length;

    return (
        <div className="min-h-screen bg-muted/20 px-4 py-8 font-sans sm:px-6">
            <Head title={`Combined Scorecard - ${season.name}`} />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Back Navigation */}
                <div className="mb-4 flex items-center space-x-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/candidate/profile">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-primary">
                            Combined Scorecard
                        </h2>
                        <p className="text-muted-foreground">
                            Unified performance breakdown for your examination sitting.
                        </p>
                    </div>
                </div>

                {/* Overall Stats Cards */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <Card className="col-span-1 border-0 shadow-md ring-1 ring-border/50 md:col-span-2">
                        <CardHeader className="bg-primary/5 pb-4">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <BookOpen className="h-5 w-5 text-primary" />
                                {season.name}
                            </CardTitle>
                            <CardDescription>
                                Combined sitting comprising {sessions.length} subjects.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
                                <div>
                                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Total Questions
                                    </p>
                                    <p className="text-xl font-bold text-foreground">
                                        {totalQuestions}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Correct
                                    </p>
                                    <p className="text-xl font-bold text-green-600">
                                        {totalCorrect}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Incorrect
                                    </p>
                                    <p className="text-xl font-bold text-destructive">
                                        {totalIncorrect}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Unanswered
                                    </p>
                                    <p className="text-xl font-bold text-muted-foreground">
                                        {totalUnanswered}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                        Total Earned
                                    </p>
                                    <p className="text-xl font-bold text-foreground">
                                        {earnedMarks} / {totalMarks} Marks
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-1 flex flex-col justify-between border-0 shadow-md ring-1 ring-border/50">
                        <CardHeader className="pb-2 text-center">
                            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Overall Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center pb-6 space-y-4">
                            <div className="text-center">
                                <span
                                    className={`text-5xl font-black tracking-tight ${allPassed ? 'text-green-600' : 'text-destructive'}`}
                                >
                                    {overallPercentage.toFixed(1)}%
                                </span>
                            </div>
                            <Badge
                                variant={allPassed ? 'default' : 'destructive'}
                                className={`px-4 py-1.5 text-xs font-bold tracking-wider uppercase ${allPassed ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            >
                                {allPassed ? 'PASSED ALL' : 'FAILED ONE OR MORE'}
                            </Badge>
                            <p className="text-center text-xs text-muted-foreground">
                                Pass status requires passing all individual subjects.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Subject Selector Tabs */}
                <div className="border-b border-border/60 pb-1.5">
                    <div className="flex gap-2 overflow-x-auto">
                        {sessions.map((s) => {
                            const isActive = activeSubjectId === s.subject_id;
                            const isSubPassed = s.passed;
                            return (
                                <button
                                    key={s.id}
                                    onClick={() => setActiveSubjectId(s.subject_id)}
                                    className={`relative rounded-lg px-4 py-2.5 text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                                        isActive
                                            ? 'bg-primary text-primary-foreground shadow-sm'
                                            : 'text-muted-foreground hover:bg-muted hover:text-foreground bg-background border border-border/50'
                                    }`}
                                >
                                    {s.subject?.name}
                                    <Badge
                                        variant={isSubPassed ? 'secondary' : 'destructive'}
                                        className={`px-1.5 py-0 text-[10px] ${
                                            isActive
                                                ? 'bg-primary-foreground/20 text-primary-foreground border-transparent'
                                                : isSubPassed
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {Number(s.score).toFixed(1)}%
                                    </Badge>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Active Subject Results Section */}
                {activeSession && (
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Subject Details Sidecard */}
                        <div className="md:col-span-1">
                            <Card className="border-0 shadow-md ring-1 ring-border/50 sticky top-24">
                                <CardHeader className="border-b bg-muted/10">
                                    <CardTitle className="text-lg leading-snug">
                                        {activeSubject?.name}
                                    </CardTitle>
                                    <CardDescription className="font-mono text-xs text-muted-foreground">
                                        {activeSubject?.code}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="text-sm text-muted-foreground">Subject Score:</span>
                                        <span className={`text-lg font-bold ${activeSession.passed ? 'text-green-600' : 'text-destructive'}`}>
                                            {Number(activeSession.score).toFixed(1)}%
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="text-sm text-muted-foreground">Pass Mark Required:</span>
                                        <span className="font-semibold text-sm">{activeSubject?.pass_mark}%</span>
                                    </div>
                                    <div className="flex items-center justify-between border-b pb-2">
                                        <span className="text-sm text-muted-foreground">Subject Status:</span>
                                        <Badge
                                            variant={activeSession.passed ? 'default' : 'destructive'}
                                            className={`px-2 py-0.5 text-xs ${activeSession.passed ? 'bg-green-600' : ''}`}
                                        >
                                            {activeSession.passed ? 'PASSED' : 'FAILED'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-2 pt-2 text-sm text-muted-foreground">
                                        <div className="flex justify-between">
                                            <span>Correct Answers:</span>
                                            <span className="font-medium text-green-600">{activeCorrect}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Incorrect Answers:</span>
                                            <span className="font-medium text-destructive">{activeIncorrect}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Unanswered:</span>
                                            <span className="font-medium text-foreground">{activeUnanswered}</span>
                                        </div>
                                        <div className="flex justify-between border-t border-dashed pt-2 font-medium">
                                            <span className="text-foreground">Raw Marks:</span>
                                            <span className="text-foreground">{activeEarnedMarks} / {activeTotalMarks}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Subject Questions Breakdown */}
                        <div className="md:col-span-2 space-y-6">
                            <Card className="border-0 shadow-md ring-1 ring-border/50">
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-primary" />
                                        Question Breakdown
                                    </CardTitle>
                                    <CardDescription>
                                        Detailed breakdown of your answers in {activeSubject?.name}.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {activeAnswers.map((answer: any, index: number) => {
                                        const correctOption = answer.question?.options?.find(
                                            (o: any) => o.is_correct,
                                        );

                                        return (
                                            <div
                                                key={answer.id}
                                                className="rounded-lg border bg-muted/20 p-4"
                                            >
                                                <div className="mb-4 flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className="flex items-start gap-2 text-base font-semibold">
                                                            <span className="w-6 shrink-0 text-muted-foreground">
                                                                {index + 1}.
                                                            </span>
                                                            <span
                                                                dangerouslySetInnerHTML={{
                                                                    __html: answer.question?.question_text,
                                                                }}
                                                            />
                                                        </h4>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            answer.is_correct
                                                                ? 'default'
                                                                : 'destructive'
                                                        }
                                                        className={
                                                            answer.is_correct
                                                                ? 'bg-green-600 text-white border-transparent'
                                                                : 'text-white border-transparent'
                                                        }
                                                    >
                                                        {answer.is_correct
                                                            ? 'Correct'
                                                            : 'Incorrect'}{' '}
                                                        (
                                                        {answer.is_correct
                                                            ? answer.question?.marks
                                                            : 0}
                                                        /{answer.question?.marks} marks)
                                                    </Badge>
                                                </div>

                                                <div className="ml-8 space-y-2">
                                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                        <div className="rounded-md border bg-background p-3">
                                                            <p className="mb-1 text-xs font-bold text-muted-foreground uppercase">
                                                                Your Answer:
                                                            </p>
                                                            <div className="flex items-center gap-2 text-sm">
                                                                {answer.selected_option ? (
                                                                    <>
                                                                        {answer.is_correct ? (
                                                                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                                                                        ) : (
                                                                            <X className="h-4 w-4 text-destructive shrink-0" />
                                                                        )}
                                                                        <span
                                                                            dangerouslySetInnerHTML={{
                                                                                __html: `<strong>${answer.selected_option.option_label}.</strong> ${answer.selected_option.option_text}`,
                                                                            }}
                                                                        />
                                                                    </>
                                                                ) : (
                                                                    <span className="text-muted-foreground italic">
                                                                        Did not answer
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {!answer.is_correct && correctOption && (
                                                            <div className="rounded-md border border-green-200 bg-green-50 p-3 dark:border-green-900/30 dark:bg-green-950/20">
                                                                <p className="mb-1 text-xs font-bold text-green-700 uppercase dark:text-green-400">
                                                                    Correct Answer:
                                                                </p>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                    <Check className="h-4 w-4 text-green-600 shrink-0" />
                                                                    <span
                                                                        dangerouslySetInnerHTML={{
                                                                            __html: `<strong>${correctOption.option_label}.</strong> ${correctOption.option_text}`,
                                                                        }}
                                                                    />
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
                    </div>
                )}
            </div>
        </div>
    );
}
