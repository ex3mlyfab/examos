import { Head, router } from '@inertiajs/react';
import { Clock, AlertCircle, ChevronLeft, ChevronRight, Flag, Send, Settings2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Subject, CandidateExamSession, Question, CandidateAnswer } from '@/types/exam';

interface PageProps {
    subject: Subject;
    session: CandidateExamSession & { answers: CandidateAnswer[] };
    questions: Question[];
    remainingSeconds: number;
    [key: string]: any;
}

export default function ExamRoom({ subject, session, questions, remainingSeconds: initialRemaining }: PageProps) {
    const [timeLeft, setTimeLeft] = useState(initialRemaining);
    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number | null>>({});
    const [flagged, setFlagged] = useState<Record<number, boolean>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [questionsPerPage, setQuestionsPerPage] = useState<number>(1);

    const totalPages = Math.ceil((questions?.length || 0) / questionsPerPage);
    
    const timerRef = useRef<NodeJS.Timeout>();

    // Initialize answers state from DB
    useEffect(() => {
        if (session.answers) {
            const initialAnswers: Record<number, number | null> = {};
            const initialFlagged: Record<number, boolean> = {};
            
            session.answers.forEach(ans => {
                if (ans.selected_option_id) {
initialAnswers[ans.question_id] = ans.selected_option_id;
}

                if (ans.is_flagged) {
initialFlagged[ans.question_id] = ans.is_flagged;
}
            });
            
            setAnswers(initialAnswers);
            setFlagged(initialFlagged);
        }
    }, [session.answers]);

    const endTimeRef = useRef(Date.now() + initialRemaining * 1000);

    // Timer logic
    useEffect(() => {
        if (isSubmitting) {
return;
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

        // Sync with server every 2 minutes
        const syncInterval = setInterval(() => {
            fetch(`/candidate/sync-time/${session.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.remainingSeconds !== undefined) {
                        const currentLocalRemaining = Math.round((endTimeRef.current - Date.now()) / 1000);

                        // Only correct if we are drifting significantly (e.g. > 5 seconds)
                        if (Math.abs(data.remainingSeconds - currentLocalRemaining) > 5) {
                            endTimeRef.current = Date.now() + data.remainingSeconds * 1000;
                            setTimeLeft(data.remainingSeconds);
                        }
                    }
                })
                .catch(err => console.error("Time sync failed", err));
        }, 120000);

        return () => {
            clearInterval(timerRef.current);
            clearInterval(syncInterval);
        };
    }, [isSubmitting, session.id]);

    // WebSocket listener for admin release
    useEffect(() => {
        if (!window.Echo || !session.candidate_id) {
return;
}
        
        const channel = window.Echo.private(`candidate.${session.candidate_id}`);
        
        channel.listen('AdminReleasedDevice', (e: any) => {
            toast.error("Your device lock has been released by an administrator. You have been logged out.", {
                duration: Infinity,
            });
            // Force reload which will hit device lock middleware or just log them out
            setTimeout(() => {
                window.location.href = '/candidate/login';
            }, 3000);
        });

        return () => {
            window.Echo.leave(`candidate.${session.candidate_id}`);
        };
    }, [session.candidate_id]);

    // Keyboard navigation and shortcuts
    useEffect(() => {
        if (questionsPerPage !== 1 || isSubmitting) {
return;
}

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
return;
}

            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                setCurrentPage(p => Math.max(0, p - 1));
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                setCurrentPage(p => Math.min(totalPages - 1, p + 1));
            } else {
                const key = e.key.toUpperCase();

                if (['A', 'B', 'C', 'D'].includes(key)) {
                    const q = questions ? questions[currentPage] : null;

                    if (q && q.options) {
                        const optIndex = ['A', 'B', 'C', 'D'].indexOf(key);
                        const opt = q.options.find(o => o.option_label?.toUpperCase() === key) || q.options[optIndex];

                        if (opt) {
                            handleAnswerChange(q.id, opt.id);
                        }
                    }
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [questionsPerPage, currentPage, totalPages, questions, isSubmitting, flagged]);

    const handleTimeUp = () => {
        setIsSubmitting(true);
        toast.error("Time is up! Submitting your exam automatically...", { duration: 5000 });
        submitExam();
    };

    const submitExam = () => {
        setIsSubmitting(true);
        router.post(`/candidate/submit/${session.id}`, {}, {
            replace: true,
            onError: () => {
                setIsSubmitting(false);
                toast.error("Failed to submit. Please try again.");
            }
        });
    };

    const handleAnswerChange = (questionId: number, optionId: number) => {
        setAnswers(prev => ({ ...prev, [questionId]: optionId }));
        saveAnswerToServer(questionId, optionId, flagged[questionId]);
    };

    const toggleFlag = (questionId: number) => {
        const isCurrentlyFlagged = flagged[questionId] || false;
        const newFlagState = !isCurrentlyFlagged;
        setFlagged(prev => ({ ...prev, [questionId]: newFlagState }));
        
        saveAnswerToServer(questionId, answers[questionId] ?? null, newFlagState);
        toast.info(newFlagState ? "Question flagged for review" : "Flag removed");
    };

    const saveAnswerToServer = (questionId: number, optionId: number | null, isFlagged: boolean = false) => {
        // CSRF Token is included automatically by Axios, but we'll use fetch here with meta tag extraction
        const token = document.head.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        
        fetch(`/candidate/answer/${session.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': token,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ question_id: questionId, option_id: optionId, is_flagged: isFlagged })
        }).catch(err => {
            console.error("Failed to save answer", err);
            toast.error("Network error: Failed to save your last answer. Please check your connection.");
        });
    };

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
        setCurrentPage(0);
    };

    if (!questions || questions.length === 0) {
        return <div className="p-8 text-center">No questions available for this subject.</div>;
    }

    const currentQuestions = questions.slice(currentPage * questionsPerPage, (currentPage + 1) * questionsPerPage);
    const progressPercentage = ((currentPage + 1) / totalPages) * 100;
    
    const answeredCount = Object.keys(answers).filter(k => answers[parseInt(k)] !== null).length;

    return (
        <div className="min-h-screen bg-muted/20 font-sans pb-20">
            <Head title={`Exam Room - ${subject.name}`} />

            {/* Sticky Top Header with Timer */}
            <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b px-4 py-3 md:px-8 shadow-sm transition-all duration-300">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="font-bold text-sm md:text-base leading-tight">{subject.name}</h1>
                            <p className="text-xs text-muted-foreground">{subject.code}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4">
                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-sm mr-2 ${isCriticalTime ? 'bg-destructive/10 border-destructive/30 text-destructive animate-pulse' : 'bg-primary/5 border-primary/20 text-primary'}`}>
                            <Clock className={`h-5 w-5 ${isCriticalTime ? 'text-destructive' : 'text-primary'}`} />
                            <span className="font-mono font-bold text-lg tabular-nums tracking-tight">
                                {formatTime(timeLeft)}
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-2">
                            <Select value={questionsPerPage.toString()} onValueChange={handleQuestionsPerPageChange}>
                                <SelectTrigger className="w-[180px] h-9 text-xs">
                                    <Settings2 className="w-3 h-3 mr-2" />
                                    <SelectValue placeholder="Questions per view" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">1 Question per view</SelectItem>
                                    <SelectItem value="2">2 Questions per view</SelectItem>
                                    <SelectItem value="3">3 Questions per view</SelectItem>
                                    <SelectItem value="4">4 Questions per view</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <Progress value={progressPercentage} className="h-1 rounded-none bg-muted/50" />
            </header>

            <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 md:py-8 grid md:grid-cols-12 gap-6">
                
                {/* Left Column: Questions */}
                <div className="md:col-span-8 lg:col-span-9 space-y-6">
                    {currentQuestions.map((q, idx) => {
                        const globalIndex = currentPage * questionsPerPage + idx + 1;
                        const isFlagged = flagged[q.id];
                        
                        return (
                            <Card key={q.id} className={`shadow-sm border transition-all ${isFlagged ? 'border-amber-400 ring-1 ring-amber-400/50' : ''}`}>
                                <CardHeader className="bg-muted/30 pb-4 flex flex-row items-start justify-between gap-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-base font-medium flex items-center gap-2">
                                            <span className="flex items-center justify-center bg-primary text-primary-foreground h-6 w-6 rounded-full text-xs font-bold shrink-0">
                                                {globalIndex}
                                            </span>
                                            <span className="text-muted-foreground text-sm font-normal">
                                                ({q.marks} {q.marks === 1 ? 'mark' : 'marks'})
                                            </span>
                                        </CardTitle>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => toggleFlag(q.id)}
                                        className={isFlagged ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : 'text-muted-foreground hover:text-amber-600'}
                                    >
                                        <Flag className={`h-4 w-4 mr-2 ${isFlagged ? 'fill-current' : ''}`} />
                                        {isFlagged ? 'Flagged' : 'Flag for review'}
                                    </Button>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="text-lg mb-6 leading-relaxed whitespace-pre-wrap">
                                        {q.question_text}
                                    </div>
                                    
                                    <RadioGroup 
                                        value={answers[q.id]?.toString() || ''} 
                                        onValueChange={(val) => handleAnswerChange(q.id, parseInt(val))}
                                        className="space-y-3"
                                    >
                                        {q.options?.map(opt => (
                                            <div key={opt.id} className="flex items-center space-x-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:bg-primary/5">
                                                <RadioGroupItem value={opt.id.toString()} id={`opt-${opt.id}`} className="shrink-0 text-primary" />
                                                <Label htmlFor={`opt-${opt.id}`} className="flex-1 cursor-pointer font-normal text-base leading-relaxed">
                                                    <span className="font-bold mr-2 text-muted-foreground">{opt.option_label}.</span>
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
                    <div className="flex items-center justify-between pt-4 border-t">
                        <Button 
                            variant="outline" 
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0 || isSubmitting}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                        </Button>
                        
                        <div className="text-sm font-medium text-muted-foreground">
                            Page {currentPage + 1} of {totalPages}
                        </div>

                        {currentPage === totalPages - 1 ? (
                            <Button 
                                onClick={() => {
                                    if (confirm("Are you sure you want to submit your exam? This action cannot be undone.")) {
                                        submitExam();
                                    }
                                }}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Submit Exam <Send className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button 
                                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                disabled={isSubmitting}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right Column: Navigator Panel */}
                <div className="md:col-span-4 lg:col-span-3">
                    <Card className="sticky top-24 shadow-sm border-0 ring-1 ring-border">
                        <CardHeader className="bg-muted/30 pb-4 border-b">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                                Question Navigator
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex flex-wrap gap-2 mb-6">
                                {questions.map((q, idx) => {
                                    const pageNum = Math.floor(idx / questionsPerPage);
                                    const isAnswered = answers[q.id] !== undefined && answers[q.id] !== null;
                                    const isFlagged = flagged[q.id];
                                    const isCurrentPage = pageNum === currentPage;
                                    
                                    let btnClass = "h-8 w-8 text-xs p-0 border shadow-sm transition-all ";
                                    
                                    if (isFlagged) {
                                        btnClass += "bg-amber-100 border-amber-400 text-amber-900 ";
                                    } else if (isAnswered) {
                                        btnClass += "bg-primary text-primary-foreground border-primary ";
                                    } else {
                                        btnClass += "bg-background text-muted-foreground hover:bg-muted ";
                                    }
                                    
                                    if (isCurrentPage && !isAnswered && !isFlagged) {
                                        btnClass += "ring-2 ring-primary ring-offset-1 ";
                                    }

                                    return (
                                        <Button
                                            key={q.id}
                                            variant="outline"
                                            className={btnClass}
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {idx + 1}
                                        </Button>
                                    );
                                })}
                            </div>

                            <div className="space-y-2 text-sm pt-4 border-t border-dashed">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Answered:</span>
                                    <span className="font-medium text-primary">{answeredCount} / {questions.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Unanswered:</span>
                                    <span className="font-medium">{questions.length - answeredCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground flex items-center gap-1">
                                        <Flag className="h-3 w-3 text-amber-500 fill-amber-500" /> Flagged:
                                    </span>
                                    <span className="font-medium text-amber-600">
                                        {Object.values(flagged).filter(Boolean).length}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="pt-0 bg-muted/10 pb-4">
                             <Button 
                                variant="destructive" 
                                className="w-full mt-4 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
                                onClick={() => {
                                    if (confirm("Are you sure you want to finish and submit the exam early?")) {
                                        submitExam();
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                Finish Early
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
                
            </main>
        </div>
    );
}
