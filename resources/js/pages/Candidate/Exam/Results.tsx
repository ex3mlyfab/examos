import { Head, Link } from '@inertiajs/react';
import { CheckCircle, XCircle, ChevronLeft, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { CandidateExamSession } from '@/types/exam';
import CombinedResults from './CombinedResults';

interface PageProps {
    sessions: any[];
    season: any;
    allowReview: boolean;
    isCombined: boolean;
}

export default function Results({ sessions, season, allowReview, isCombined }: PageProps) {
    if (!allowReview) {
        return (
            <div className="min-h-screen bg-muted/20 px-4 py-12 font-sans sm:px-6">
                <Head title="Submission Confirmed" />

                <div className="mx-auto max-w-md space-y-6 text-center">
                    <Card className="border-0 shadow-lg ring-1 ring-primary/10">
                        <CardContent className="flex flex-col items-center justify-center p-8 md:p-10 space-y-6">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                <CheckCircle2 className="h-10 w-10" />
                            </div>

                            <div className="space-y-2">
                                <h1 className="text-2xl font-black tracking-tight text-foreground">
                                    Exam Submitted Successfully
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Thank you! Your responses have been recorded.
                                </p>
                            </div>

                            <div className="w-full bg-muted/40 rounded-lg p-4 border text-left text-sm space-y-2 text-muted-foreground">
                                <p><strong>Examination:</strong> {season?.name}</p>
                                <p><strong>Status:</strong> Completed</p>
                                {isCombined ? (
                                    <p><strong>Subjects Submitted:</strong> {sessions.length}</p>
                                ) : (
                                    <p><strong>Subject Submitted:</strong> {sessions[0]?.subject?.name}</p>
                                )}
                            </div>

                            <div className="w-full border-t border-dashed pt-4 flex gap-3 text-amber-800 bg-amber-50/50 p-4 rounded-lg text-xs leading-relaxed text-left border-amber-100">
                                <div className="mt-0.5 font-bold uppercase shrink-0">Note:</div>
                                <div>Results and scorecards are not yet released for review. Please check back later.</div>
                            </div>

                            <Link href="/candidate/profile" className="w-full">
                                <Button className="w-full shadow-md">
                                    Go to Dashboard
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (isCombined) {
        return <CombinedResults season={season} sessions={sessions} />;
    }

    return (
        <div className="min-h-screen bg-muted/20 px-4 py-8 font-sans sm:px-6">
            <Head title="My Results" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">
                            Examination Results
                        </h1>
                        <p className="mt-1 text-muted-foreground">
                            Review your performance across completed
                            examinations.
                        </p>
                    </div>
                    <Link href="/candidate/profile">
                        <Button variant="outline" className="hidden sm:flex">
                            <ChevronLeft className="mr-2 h-4 w-4" /> Back to
                            Dashboard
                        </Button>
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <Award className="mb-4 h-16 w-16 opacity-20" />
                            <p className="text-lg font-medium">
                                No results available
                            </p>
                            <p className="text-sm">
                                You haven't completed any examinations yet.
                            </p>
                            <Link href="/candidate/profile" className="mt-6">
                                <Button>Return to Dashboard</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {sessions.map((session) => (
                            <Card
                                key={session.id}
                                className={`overflow-hidden border-l-4 shadow-sm ${session.passed ? 'border-l-green-500' : 'border-l-destructive'}`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div className="flex-1 space-y-2 p-6">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold">
                                                {session.subject?.name}
                                            </h2>
                                            <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                                                {session.subject?.code}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Completed on:{' '}
                                            {new Date(
                                                session.completed_at || '',
                                            ).toLocaleDateString('en-US', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex min-w-[200px] flex-row items-center justify-between gap-4 border-t p-6 md:flex-col md:justify-center md:border-t-0 md:border-l ${session.passed ? 'bg-green-50/50' : 'bg-red-50/50'}`}
                                    >
                                        <div className="text-center">
                                            <div className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                                Score
                                            </div>
                                            <div className="font-mono text-3xl font-black tracking-tighter">
                                                {Number(session.score).toFixed(
                                                    1,
                                                )}
                                                %
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 font-bold">
                                            {session.passed ? (
                                                <div className="flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-600">
                                                    <CheckCircle className="mr-1.5 h-4 w-4" />{' '}
                                                    Passed
                                                </div>
                                            ) : (
                                                <div className="flex items-center rounded-full bg-red-100 px-3 py-1 text-sm text-destructive">
                                                    <XCircle className="mr-1.5 h-4 w-4" />{' '}
                                                    Failed
                                                </div>
                                            )}
                                        </div>

                                        <Link
                                            href={`/candidate/results/${session.id}`}
                                            className="mt-2 w-full"
                                        >
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full bg-white/50 hover:bg-white/80"
                                            >
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
