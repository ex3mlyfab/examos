import { Head, Link, usePage } from '@inertiajs/react';
import { LogOut, BookOpen, Clock, User, Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import type { Candidate, Subject, CandidateExamSession } from '@/types/exam';

interface PageProps {
    candidate: Candidate & {
        examSeason: any;
        subjects: Subject[];
        sessions: CandidateExamSession[];
    };
    [key: string]: any;
}

export default function Profile() {
    const { candidate } = usePage<PageProps>().props;
    
    // Helper to find session for a subject
    const getSessionForSubject = (subjectId: number) => {
        return candidate.sessions?.find(s => s.subject_id === subjectId);
    };

    return (
        <div className="min-h-screen bg-muted/20 font-sans pb-12">
            <Head title="Candidate Dashboard" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md shadow-sm">
                <div className="flex flex-1 items-center gap-2 font-semibold text-lg text-primary">
                    <BookOpen className="h-6 w-6" />
                    <span>ExamOS</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm font-medium hidden sm:inline-block">
                        {candidate.name} ({candidate.file_no})
                    </span>
                    <Link href="/candidate/logout" method="post" as="button">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <LogOut className="h-5 w-5" />
                            <span className="sr-only">Log out</span>
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto p-4 md:p-8 max-w-5xl space-y-8 mt-4">
                
                {/* Welcome Hero Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-teal-600 p-8 text-primary-foreground shadow-lg">
                    <div className="relative z-10">
                        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome, {candidate.name}</h1>
                        <p className="text-primary-foreground/80 max-w-xl text-lg">
                            {candidate.examSeason?.name || 'Upcoming Examination Season'}
                        </p>
                    </div>
                    {/* Decorative background element */}
                    <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Profile Summary */}
                    <Card className="md:col-span-1 shadow-sm border-0 ring-1 ring-border/50">
                        <CardHeader>
                            <CardTitle className="text-xl flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Candidate Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">File Number</span>
                                <span className="font-medium text-foreground">{candidate.file_no}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Department</span>
                                <span className="font-medium text-foreground">{candidate.department || 'N/A'}</span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Level</span>
                                <span className="font-medium text-foreground">{candidate.level || 'N/A'}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Allocated Subjects */}
                    <div className="md:col-span-2 space-y-6">
                        <h2 className="text-2xl font-bold tracking-tight">Your Examinations</h2>
                        
                        {candidate.subjects?.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <BookOpen className="h-12 w-12 mb-4 opacity-20" />
                                    <p>No examinations have been allocated to you yet.</p>
                                    <p className="text-sm">Please contact your invigilator.</p>
                                </CardContent>
                            </Card>
                        ) : candidate.examSeason?.exam_mode === 'combined' ? (
                            <Card className="flex flex-col shadow-md border-0 ring-1 ring-border/50">
                                <CardHeader className="pb-3 border-b bg-muted/10">
                                    <CardTitle className="text-xl leading-tight">Combined Subject Examination</CardTitle>
                                    <CardDescription>You will take the following subjects in a single sitting.</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 py-4 space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <div className="flex items-center gap-1.5 text-primary">
                                            <Clock className="h-5 w-5" />
                                            <span>Total Time: {candidate.examSeason?.combo_settings?.total_duration_minutes || 'N/A'} mins</span>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Subjects Included:</span>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {candidate.subjects?.map(sub => (
                                                <li key={sub.id} className="flex items-center gap-2 p-2 rounded bg-muted/30 border text-sm">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                    <span>{sub.name} <span className="text-xs text-muted-foreground">({sub.code})</span></span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-4 border-t bg-muted/5">
                                    <Link href="/candidate/combined-instructions" className="w-full">
                                        <Button size="lg" className="w-full shadow-md text-lg">
                                            Start Combined Exam
                                        </Button>
                                    </Link>
                                </CardFooter>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {candidate.subjects?.map((subject) => {
                                    const session = getSessionForSubject(subject.id);
                                    const isCompleted = session?.status === 'completed';
                                    const isActive = session?.status === 'active';

                                    return (
                                        <Card key={subject.id} className={`flex flex-col shadow-sm border-0 ring-1 transition-all hover:shadow-md ${isCompleted ? 'ring-green-500/20 bg-green-50/30' : 'ring-border/50'}`}>
                                            <CardHeader className="pb-3">
                                                <div className="flex justify-between items-start">
                                                    <CardTitle className="text-lg leading-tight">{subject.name}</CardTitle>
                                                    {isCompleted && <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />}
                                                </div>
                                                <CardDescription className="font-mono text-xs">{subject.code}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-1 pb-2">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4" />
                                                        <span>{subject.duration_minutes} mins</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Award className="h-4 w-4" />
                                                        <span>Pass: {subject.pass_mark}%</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-2">
                                                {isCompleted ? (
                                                    <Button variant="secondary" className="w-full bg-green-100 text-green-800 hover:bg-green-200 pointer-events-none">
                                                        Completed
                                                    </Button>
                                                ) : isActive ? (
                                                    <Link href={`/candidate/room/${subject.id}`} className="w-full">
                                                        <Button variant="default" className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm">
                                                            Resume Exam
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Link href={`/candidate/instructions/${subject.id}`} className="w-full">
                                                        <Button variant="default" className="w-full shadow-sm transition-transform active:scale-95">
                                                            Start Exam
                                                        </Button>
                                                    </Link>
                                                )}
                                            </CardFooter>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
