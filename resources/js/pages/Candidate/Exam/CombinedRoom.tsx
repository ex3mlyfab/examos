import { Head, router } from '@inertiajs/react';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Flag,
    Send,
    Settings2,
    BookOpen,
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type {
    Subject,
    CandidateExamSession,
    Question,
    CandidateAnswer,
    ExamSeason,
} from '@/types/exam';

interface SubjectDataItem {
    subject: Subject;
    session: CandidateExamSession & { answers: CandidateAnswer[] };
    questions: Question[];
}

interface PageProps {
    season: ExamSeason;
    subjectData: SubjectDataItem[];
    remainingSeconds: number;
}

export default function CombinedRoom({
    season,
    subjectData,
    remainingSeconds: initialRemaining,
}: PageProps) {
    const [timeLeft, setTimeLeft] = useState(initialRemaining);
    const [activeSubjectId, setActiveSubjectId] = useState<number>(
        subjectData[0]?.subject.id || 0,
    );
    const [currentPages, setCurrentPages] = useState<Record<number, number>>({});
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [flagged, setFlagged] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionsPerPage, setQuestionsPerPage] = useState<number>(1);

    const isCriticalTime = timeLeft <= 300;
    const timerRef = useRef<NodeJS.Timeout>();
    const endTimeRef = useRef<number>(0);

    // Get current subject data item
    const activeItem = subjectData.find((sd) => sd.subject.id === activeSubjectId) || subjectData[0];
    const activeQuestions = activeItem?.questions || [];
    const activeSubjectPage = currentPages[activeSubjectId] || 0;
    const totalPages = Math.ceil((activeQuestions.length || 0) / questionsPerPage);

    // Helper to get session ID for a question ID
    const getSessionIdForQuestion = (questionId: number) => {
        const item = subjectData.find((sd) => sd.questions.some((q) => q.id === questionId));
        return item ? item.session.id : null;
    };

    // Initialize answers state from DB across all subjects
    useEffect(() => {
        const initialAnswers: Record<number, number | null> = {};
        const initialFlagged: Record<number, boolean> = {};

        subjectData.forEach((sd) => {
            if (sd.session.answers) {
                sd.session.answers.forEach((ans) => {
                    if (ans.selected_option_id) {
                        initialAnswers[ans.question_id] = ans.selected_option_id;
                    }
                    if (ans.is_flagged) {
                        initialFlagged[ans.question_id] = ans.is_flagged;
                    }
                });
            }
        });

        setAnswers(initialAnswers);
        setFlagged(initialFlagged);
    }, [subjectData]);

    // Timer logic
    useEffect(() => {
        if (isSubmitting) {
            return;
        }

        if (endTimeRef.current === 0) {
            endTimeRef.current = Date.now() + initialRemaining * 1000;
        }

        timerRef.current = setInterval(() => {
            const now = Date.now();
            const remaining = Math.round((endTimeRef.current - now) / 1000);

            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(timerRef.current);
                handleTimeUp();
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        // Sync with server every 2 minutes using the first session ID
        const firstSessionId = subjectData[0]?.session.id;
        const syncInterval = setInterval(() => {
            if (!firstSessionId) return;
            fetch(`/candidate/sync-time/${firstSessionId}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.remainingSeconds !== undefined) {
                        const currentLocalRemaining = Math.round(
                            (endTimeRef.current - Date.now()) / 1000,
                        );

                        if (Math.abs(data.remainingSeconds - currentLocalRemaining) > 5) {
                            endTimeRef.current = Date.now() + data.remainingSeconds * 1000;
                            setTimeLeft(data.remainingSeconds);
                        }
                    }
                })
                .catch((err) => console.error('Time sync failed', err));
        }, 120000);

        return () => {
            clearInterval(timerRef.current);
            clearInterval(syncInterval);
        };
    }, [isSubmitting, subjectData]);

    // WebSocket listener for admin release
    useEffect(() => {
        const firstSession = subjectData[0]?.session;
        if (!window.Echo || !firstSession?.candidate_id) {
            return;
        }

        const channel = window.Echo.private(
            `candidate.${firstSession.candidate_id}`,
        );

        channel.listen('AdminReleasedDevice', () => {
            toast.error(
                'Your device lock has been released by an administrator. You have been logged out.',
                {
                    duration: Infinity,
                },
            );
            setTimeout(() => {
                window.location.href = '/candidate/login';
            }, 3000);
        });

        return () => {
            window.Echo.leave(`candidate.${firstSession.candidate_id}`);
        };
    }, [subjectData]);

    // Keyboard navigation and shortcuts for the active subject
    useEffect(() => {
        if (questionsPerPage !== 1 || isSubmitting) {
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentPages((prev) => ({
                    ...prev,
                    [activeSubjectId]: Math.max(0, (prev[activeSubjectId] || 0) - 1),
                }));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentPages((prev) => ({
                    ...prev,
                    [activeSubjectId]: Math.min(totalPages - 1, (prev[activeSubjectId] || 0) + 1),
                }));
            } else {
                const key = e.key.toUpperCase();

                if (['A', 'B', 'C', 'D'].includes(key)) {
                    const q = activeQuestions ? activeQuestions[activeSubjectPage] : null;

                    if (q && q.options) {
                        const optIndex = ['A', 'B', 'C', 'D'].indexOf(key);
                        const opt =
                            q.options.find(
                                (o) => o.option_label?.toUpperCase() === key,
                            ) || q.options[optIndex];

                        if (opt) {
                            handleAnswerChange(q.id, opt.id);
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        questionsPerPage,
        activeSubjectId,
        activeSubjectPage,
        totalPages,
        activeQuestions,
        isSubmitting,
        flagged,
    ]);

    function handleTimeUp() {
        setIsSubmitting(true);
        toast.error('Time is up! Submitting your exam automatically...', {
            duration: 5000,
        });
        submitExam();
    }

    function submitExam() {
        setIsSubmitting(true);
        router.post(
            `/candidate/submit-combined`,
            {},
            {
                replace: true,
                onError: () => {
                    setIsSubmitting(false);
                    toast.error('Failed to submit. Please try again.');
                },
            },
        );
    }

    function handleAnswerChange(questionId: number, optionId: number) {
        setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
        saveAnswerToServer(questionId, optionId, flagged[questionId]);
    }

    function toggleFlag(questionId: number) {
        const isCurrentlyFlagged = flagged[questionId] || false;
        const newFlagState = !isCurrentlyFlagged;
        setFlagged((prev) => ({ ...prev, [questionId]: newFlagState }));

        saveAnswerToServer(
            questionId,
            answers[questionId] ?? null,
            newFlagState,
        );
        toast.info(
            newFlagState ? 'Question flagged for review' : 'Flag removed',
        );
    }

    function saveAnswerToServer(
        questionId: number,
        optionId: number | null,
        isFlagged: boolean = false,
    ) {
        const token =
            document.head
                .querySelector('meta[name="csrf-token"]')
                ?.getAttribute('content') || '';

        const sessionId = getSessionIdForQuestion(questionId);
        if (!sessionId) return;

        fetch(`/candidate/answer/${sessionId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
                Accept: 'application/json',
            },
            body: JSON.stringify({
                question_id: questionId,
                option_id: optionId,
                is_flagged: isFlagged,
            }),
        }).catch((err) => {
            console.error('Failed to save answer', err);
            toast.error(
                'Network error: Failed to save your last answer. Please check your connection.',
            );
        });
    }

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }

        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleQuestionsPerPageChange = (value: string) => {
        setQuestionsPerPage(parseInt(value));
        setCurrentPages((prev) => ({
            ...prev,
            [activeSubjectId]: 0,
        }));
    };

    if (!activeQuestions || activeQuestions.length === 0) {
        return (
            <div className="p-8 text-center">
                No questions available for this subject.
            </div>
        );
    }

    const currentQuestions = activeQuestions.slice(
        activeSubjectPage * questionsPerPage,
        (activeSubjectPage + 1) * questionsPerPage,
    );
    const progressPercentage = ((activeSubjectPage + 1) / totalPages) * 100;

    // Count answers for active subject
    const activeSubjectQuestionsCount = activeQuestions.length;
    const activeSubjectAnswersCount = activeQuestions.filter(
        (q) => answers[q.id] !== undefined && answers[q.id] !== null,
    ).length;

    return (
        <div className="min-h-screen bg-muted/20 pb-20 font-sans">
            <Head title={`Exam Room - ${season.name}`} />

            {/* Sticky Top Header with Timer */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/80 px-4 py-3 shadow-sm backdrop-blur-md transition-all duration-300 md:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="hidden h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-sm leading-tight font-bold md:text-base">
                                {season.name}
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                Combined Examination
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div
                            className={`mr-2 flex items-center gap-2 rounded-full border px-4 py-1.5 shadow-sm ${isCriticalTime ? 'animate-pulse border-destructive/30 bg-destructive/10 text-destructive' : 'border-primary/20 bg-primary/5 text-primary'}`}
                        >
                            <Clock
                                className={`h-5 w-5 ${isCriticalTime ? 'text-destructive' : 'text-primary'}`}
                            />
                            <span className="font-mono text-lg font-bold tracking-tight tabular-nums">
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        <div className="hidden items-center gap-2 md:flex">
                            <Select
                                value={questionsPerPage.toString()}
                                onValueChange={handleQuestionsPerPageChange}
                            >
                                <SelectTrigger className="h-9 w-[180px] text-xs">
                                    <Settings2 className="mr-2 h-3 w-3" />
                                    <SelectValue placeholder="Questions per view" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">
                                        1 Question per view
                                    </SelectItem>
                                    <SelectItem value="2">
                                        2 Questions per view
                                    </SelectItem>
                                    <SelectItem value="3">
                                        3 Questions per view
                                    </SelectItem>
                                    <SelectItem value="4">
                                        4 Questions per view
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
            </header>

            {/* Subject Tabs */}
            <div className="border-b bg-background px-4 md:px-8 py-1.5 shadow-sm">
                <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto">
                    {subjectData.map(({ subject }) => {
                        const isActive = activeSubjectId === subject.id;
                        return (
                            <button
                                key={subject.id}
                                onClick={() => setActiveSubjectId(subject.id)}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap ${
                                    isActive
                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }`}
                            >
                                {subject.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            <Progress
                value={progressPercentage}
                className="h-1 rounded-none bg-muted/50"
            />

            <main className="container mx-auto grid max-w-6xl flex-1 gap-6 px-4 py-6 md:grid-cols-12 md:py-8">
                {/* Left Column: Questions */}
                <div className="space-y-6 md:col-span-8 lg:col-span-9">
                    {currentQuestions.map((q, idx) => {
                        const globalIndex =
                            activeSubjectPage * questionsPerPage + idx + 1;
                        const isFlagged = flagged[q.id];

                        return (
                            <Card
                                key={q.id}
                                className={`border shadow-sm transition-all ${isFlagged ? 'border-amber-400 ring-1 ring-amber-400/50' : ''}`}
                            >
                                <CardHeader className="flex flex-row items-start justify-between gap-4 bg-muted/30 pb-4">
                                    <div className="space-y-1">
                                        <CardTitle className="flex items-center gap-2 text-base font-medium">
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                                {globalIndex}
                                            </span>
                                            <span className="text-sm font-normal text-muted-foreground">
                                                ({q.marks}{' '}
                                                {q.marks === 1
                                                    ? 'mark'
                                                    : 'marks'}
                                                )
                                            </span>
                                        </CardTitle>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleFlag(q.id)}
                                        className={
                                            isFlagged
                                                ? 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                                                : 'text-muted-foreground hover:text-amber-600'
                                        }
                                    >
                                        <Flag
                                            className={`mr-2 h-4 w-4 ${isFlagged ? 'fill-current' : ''}`}
                                        />
                                        {isFlagged
                                            ? 'Flagged'
                                            : 'Flag for review'}
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="mb-6 text-lg leading-relaxed whitespace-pre-wrap">
                                        {q.question_text}
                                    </div>

                                    <RadioGroup
                                        value={answers[q.id]?.toString() || ''}
                                        onValueChange={(val) =>
                                            handleAnswerChange(
                                                q.id,
                                                parseInt(val),
                                            )
                                        }
                                        className="space-y-3"
                                    >
                                        {q.options?.map((opt) => (
                                            <div
                                                key={opt.id}
                                                className="flex cursor-pointer items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5"
                                            >
                                                <RadioGroupItem
                                                    value={opt.id.toString()}
                                                    id={`opt-${opt.id}`}
                                                    className="shrink-0 text-primary"
                                                />
                                                <Label
                                                    htmlFor={`opt-${opt.id}`}
                                                    className="flex-1 cursor-pointer text-base leading-relaxed font-normal"
                                                >
                                                    <span className="mr-2 font-bold text-muted-foreground">
                                                        {opt.option_label}.
                                                    </span>
                                                    {opt.option_text}
                                                </Label>
                                            </div>
                                        ))}
                                    </RadioGroup>
                                </CardContent>
                            </Card>
                        );
                    })}

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between border-t pt-4">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setCurrentPages((prev) => ({
                                    ...prev,
                                    [activeSubjectId]: Math.max(0, (prev[activeSubjectId] || 0) - 1),
                                }))
                            }
                            disabled={activeSubjectPage === 0 || isSubmitting}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                        </Button>

                        <div className="text-sm font-medium text-muted-foreground">
                            Page {activeSubjectPage + 1} of {totalPages}
                        </div>

                        {activeSubjectPage === totalPages - 1 ? (
                            <div className="flex gap-2">
                                <Button
                                    onClick={() => {
                                        if (
                                            confirm(
                                                'Are you sure you want to submit your entire exam? This action cannot be undone.',
                                            )
                                        ) {
                                            submitExam();
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="bg-green-600 text-white hover:bg-green-700"
                                >
                                    Submit Combined Exam <Send className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() =>
                                    setCurrentPages((prev) => ({
                                        ...prev,
                                        [activeSubjectId]: Math.min(totalPages - 1, (prev[activeSubjectId] || 0) + 1),
                                    }))
                                }
                                disabled={isSubmitting}
                            >
                                Next <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right Column: Navigator Panel */}
                <div className="md:col-span-4 lg:col-span-3">
                    <Card className="sticky top-24 border-0 shadow-sm ring-1 ring-border">
                        <CardHeader className="border-b bg-muted/30 pb-4">
                            <CardTitle className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
                                Question Navigator
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="mb-6 flex flex-wrap gap-2">
                                {activeQuestions.map((q, idx) => {
                                    const pageNum = Math.floor(
                                        idx / questionsPerPage,
                                    );
                                    const isAnswered =
                                        answers[q.id] !== undefined &&
                                        answers[q.id] !== null;
                                    const isFlagged = flagged[q.id];
                                    const isCurrentPage =
                                        pageNum === activeSubjectPage;

                                    let btnClass =
                                        'h-8 w-8 text-xs p-0 border shadow-sm transition-all ';

                                    if (isFlagged) {
                                        btnClass +=
                                            'bg-amber-100 border-amber-400 text-amber-900 ';
                                    } else if (isAnswered) {
                                        btnClass +=
                                            'bg-primary text-primary-foreground border-primary ';
                                    } else {
                                        btnClass +=
                                            'bg-background text-muted-foreground hover:bg-muted ';
                                    }

                                    if (
                                        isCurrentPage &&
                                        !isAnswered &&
                                        !isFlagged
                                    ) {
                                        btnClass +=
                                            'ring-2 ring-primary ring-offset-1 ';
                                    }

                                    return (
                                        <Button
                                            key={q.id}
                                            variant="outline"
                                            className={btnClass}
                                            onClick={() =>
                                                setCurrentPages((prev) => ({
                                                    ...prev,
                                                    [activeSubjectId]: pageNum,
                                                }))
                                            }
                                        >
                                            {idx + 1}
                                        </Button>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 border-t border-dashed pt-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Subject Answered:
                                    </span>
                                    <span className="font-medium text-primary">
                                        {activeSubjectAnswersCount} / {activeSubjectQuestionsCount}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">
                                        Subject Unanswered:
                                    </span>
                                    <span className="font-medium">
                                        {activeSubjectQuestionsCount - activeSubjectAnswersCount}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Flag className="h-3 w-3 fill-amber-500 text-amber-500" />{' '}
                                        Subject Flagged:
                                    </span>
                                    <span className="font-medium text-amber-600">
                                        {
                                            activeQuestions.filter(
                                                (q) => flagged[q.id]
                                            ).length
                                        }
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="bg-muted/10 pt-0 pb-4">
                            <Button
                                variant="destructive"
                                className="mt-4 w-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                                onClick={() => {
                                    if (
                                        confirm(
                                            'Are you sure you want to finish and submit the entire combined exam early?',
                                        )
                                    ) {
                                        submitExam();
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                Finish Exam Early
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}
