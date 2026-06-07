import { Head, Link } from '@inertiajs/react';
import { CheckCircle, XCircle, ChevronLeft, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { CandidateExamSession } from '@/types/exam';

interface PageProps {
    sessions: (CandidateExamSession & { subject: any })[];
    [key: string]: any;
}

export default function Results({ sessions }: PageProps) {
    return (
        <div className="min-h-screen bg-muted/20 font-sans py-8 px-4 sm:px-6">
            <Head title="My Results" />

            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Examination Results</h1>
                        <p className="text-muted-foreground mt-1">Review your performance across completed examinations.</p>
                    </div>
                    <Link href="/candidate/profile">
                        <Button variant="outline" className="hidden sm:flex">
                            <ChevronLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                        </Button>
                    </Link>
                </div>

                {sessions.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                            <Award className="h-16 w-16 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No results available</p>
                            <p className="text-sm">You haven't completed any examinations yet.</p>
                            <Link href="/candidate/profile" className="mt-6">
                                <Button>Return to Dashboard</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6">
                        {sessions.map(session => (
                            <Card key={session.id} className={`overflow-hidden border-l-4 shadow-sm ${session.passed ? 'border-l-green-500' : 'border-l-destructive'}`}>
                                <div className="flex flex-col md:flex-row md:items-center">
                                    <div className="flex-1 p-6 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold">{session.subject?.name}</h2>
                                            <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                                                {session.subject?.code}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground">
                                            Completed on: {new Date(session.completed_at || '').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>

                                    <div className={`p-6 flex flex-row md:flex-col items-center justify-between md:justify-center gap-4 min-w-[200px] border-t md:border-t-0 md:border-l ${session.passed ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
                                        <div className="text-center">
                                            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Score</div>
                                            <div className="text-3xl font-black font-mono tracking-tighter">
                                                {Number(session.score).toFixed(1)}%
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1.5 font-bold">
                                            {session.passed ? (
                                                <div className="flex items-center text-green-600 bg-green-100 px-3 py-1 rounded-full text-sm">
                                                    <CheckCircle className="h-4 w-4 mr-1.5" /> Passed
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-destructive bg-red-100 px-3 py-1 rounded-full text-sm">
                                                    <XCircle className="h-4 w-4 mr-1.5" /> Failed
                                                </div>
                                            )}
                                        </div>

                                        <Link href={`/candidate/results/${session.id}`} className="mt-2 w-full">
                                            <Button variant="outline" size="sm" className="w-full bg-white/50 hover:bg-white/80">View Details</Button>
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
