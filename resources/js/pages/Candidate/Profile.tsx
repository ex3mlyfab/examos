import { Head, Link, usePage } from '@inertiajs/react';
import {
    LogOut,
    BookOpen,
    Clock,
    User,
    Award,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import type { Candidate, Subject, CandidateExamSession } from '@/types/exam';

interface PageProps {
    candidate: Candidate & {
        exam_season: any;
        subjects: Subject[];
        sessions: CandidateExamSession[];
    };
    [key: string]: any;
}

export default function Profile() {
    const { candidate } = usePage<PageProps>().props;

    // Helper to find session for a subject
    const getSessionForSubject = (subjectId: number) => {
        return candidate.sessions?.find((s) => s.subject_id === subjectId);
    };

    const isCombinedCompleted = candidate.subjects?.length > 0 && candidate.subjects?.every((sub) => getSessionForSubject(sub.id)?.status === 'completed');
    const isCombinedActive = candidate.subjects?.some((sub) => getSessionForSubject(sub.id)?.status === 'active');

    return (
        <div className="min-h-screen bg-muted/20 pb-12 font-sans">
            <Head title="Candidate Dashboard" />

            {/* Navigation Header */}
            <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-6 shadow-sm backdrop-blur-md">
                <div className="flex flex-1 items-center gap-2 text-lg font-semibold text-primary">
                    <BookOpen className="h-6 w-6" />
                    <span>ExamOS</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="hidden text-sm font-medium sm:inline-block">
                        {candidate.name} ({candidate.file_no})
                    </span>
                    <Link href="/candidate/logout" method="post" as="button">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="sr-only">Log out</span>
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto mt-4 max-w-5xl space-y-8 p-4 md:p-8">
                {/* Welcome Hero Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-teal-600 p-8 text-primary-foreground shadow-lg">
                    <div className="relative z-10">
                        <h1 className="mb-2 text-3xl font-bold tracking-tight">
                            Welcome, {candidate.name}
                        </h1>
                        <p className="max-w-xl text-lg text-primary-foreground/80">
                            {candidate.exam_season?.name ||
                                'Upcoming Examination Season'}
                        </p>
                    </div>
                    {/* Decorative background element */}
                    <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Left Column: Profile Summary */}
                    <Card className="border-0 shadow-sm ring-1 ring-border/50 md:col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <User className="h-5 w-5 text-primary" />
                                Candidate Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    File Number
                                </span>
                                <span className="font-medium text-foreground">
                                    {candidate.file_no}
                                </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Department
                                </span>
                                <span className="font-medium text-foreground">
                                    {candidate.department || 'N/A'}
                                </span>
                            </div>
                            <div className="flex flex-col space-y-1">
                                <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                                    Level
                                </span>
                                <span className="font-medium text-foreground">
                                    {candidate.level || 'N/A'}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Allocated Subjects */}
                    <div className="space-y-6 md:col-span-2">
                        <h2 className="text-2xl font-bold tracking-tight">
                            Your Examinations
                        </h2>

                        {candidate.subjects?.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <BookOpen className="mb-4 h-12 w-12 opacity-20" />
                                    <p>
                                        No examinations have been allocated to
                                        you yet.
                                    </p>
                                    <p className="text-sm">
                                        Please contact your invigilator.
                                    </p>
                                </CardContent>
                            </Card>
                        ) : candidate.exam_season?.exam_mode === 'combined' ? (
                            <Card className="flex flex-col border-0 shadow-md ring-1 ring-border/50">
                                <CardHeader className="border-b bg-muted/10 pb-3">
                                    <CardTitle className="text-xl leading-tight">
                                        {candidate.exam_season?.name || 'Combined Subject Examination'}
                                    </CardTitle>
                                    <CardDescription>
                                        You will take the following subjects in
                                        a single sitting.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-4 py-4">
                                    <div className="flex items-center gap-4 text-sm font-medium">
                                        <div className="flex items-center gap-1.5 text-primary">
                                            <Clock className="h-5 w-5" />
                                            <span>
                                                Total Time:{' '}
                                                {candidate.exam_season
                                                    ?.combo_settings
                                                    ?.total_duration_minutes ||
                                                    'N/A'}{' '}
                                                mins
                                            </span>
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <span className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                            Subjects Included:
                                        </span>
                                        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            {candidate.subjects?.map((sub) => (
                                                <li
                                                    key={sub.id}
                                                    className="flex items-center gap-2 rounded border bg-muted/30 p-2 text-sm"
                                                >
                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                    <span>
                                                        {sub.name}{' '}
                                                        <span className="text-xs text-muted-foreground">
                                                            ({sub.code})
                                                        </span>
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter className="border-t bg-muted/5 pt-4">
                                    {isCombinedCompleted ? (
                                        <Button
                                            variant="secondary"
                                            className="pointer-events-none w-full bg-green-100 text-green-800 hover:bg-green-200"
                                            size="lg"
                                        >
                                            Completed
                                        </Button>
                                    ) : isCombinedActive ? (
                                        <Link
                                            href="/candidate/combined-room"
                                            className="w-full"
                                        >
                                            <Button
                                                size="lg"
                                                className="w-full text-lg shadow-md bg-orange-500 text-white hover:bg-orange-600"
                                            >
                                                Resume Combined Exam
                                            </Button>
                                        </Link>
                                    ) : (
                                        <Link
                                            href="/candidate/combined-instructions"
                                            className="w-full"
                                        >
                                            <Button
                                                size="lg"
                                                className="w-full text-lg shadow-md"
                                            >
                                                Start Combined Exam
                                            </Button>
                                        </Link>
                                    )}
                                </CardFooter>
                            </Card>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {candidate.subjects?.map((subject) => {
                                    const session = getSessionForSubject(
                                        subject.id,
                                    );
                                    const isCompleted =
                                        session?.status === 'completed';
                                    const isActive =
                                        session?.status === 'active';

                                    return (
                                        <Card
                                            key={subject.id}
                                            className={`flex flex-col border-0 shadow-sm ring-1 transition-all hover:shadow-md ${isCompleted ? 'bg-green-50/30 ring-green-500/20' : 'ring-border/50'}`}
                                        >
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <CardTitle className="text-lg leading-tight">
                                                        {subject.name}
                                                    </CardTitle>
                                                    {isCompleted && (
                                                        <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                                                    )}
                                                </div>
                                                <CardDescription className="font-mono text-xs">
                                                    {subject.code}
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex-1 pb-2">
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4" />
                                                        <span>
                                                            {
                                                                subject.duration_minutes
                                                            }{' '}
                                                            mins
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Award className="h-4 w-4" />
                                                        <span>
                                                            Pass:{' '}
                                                            {subject.pass_mark}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="pt-2">
                                                {isCompleted ? (
                                                    <Button
                                                        variant="secondary"
                                                        className="pointer-events-none w-full bg-green-100 text-green-800 hover:bg-green-200"
                                                    >
                                                        Completed
                                                    </Button>
                                                ) : isActive ? (
                                                    <Link
                                                        href={`/candidate/room/${subject.id}`}
                                                        className="w-full"
                                                    >
                                                        <Button
                                                            variant="default"
                                                            className="w-full bg-orange-500 text-white shadow-sm hover:bg-orange-600"
                                                        >
                                                            Resume Exam
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={`/candidate/instructions/${subject.id}`}
                                                        className="w-full"
                                                    >
                                                        <Button
                                                            variant="default"
                                                            className="w-full shadow-sm transition-transform active:scale-95"
                                                        >
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
