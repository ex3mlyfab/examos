import { Head, Link, useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Subject } from '@/types/exam';
import { Clock, AlertTriangle, CheckCircle2, ChevronLeft, ShieldAlert } from 'lucide-react';
import { FormEvent, useState } from 'react';

export default function Instructions({ subject }: { subject: Subject }) {
    const { post, processing } = useForm();
    const [accepted, setAccepted] = useState(false);

    const startExam = (e: FormEvent) => {
        e.preventDefault();
        if (!accepted) return;
        post(`/candidate/start/${subject.id}`);
    };

    return (
        <div className="min-h-screen bg-muted/20 font-sans py-8 px-4 sm:px-6">
            <Head title={`Instructions - ${subject.name}`} />

            <div className="max-w-3xl mx-auto space-y-6">
                <Link href="/candidate/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to Dashboard
                </Link>

                <Card className="border-0 shadow-lg ring-1 ring-primary/10 overflow-hidden">
                    <div className="bg-primary p-6 text-primary-foreground flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold">{subject.name}</h1>
                            <p className="font-mono text-primary-foreground/80 mt-1">{subject.code}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full backdrop-blur-sm w-fit">
                            <Clock className="h-5 w-5" />
                            <span className="font-bold">{subject.duration_minutes} Minutes</span>
                        </div>
                    </div>

                    <CardContent className="p-6 md:p-8 space-y-8 bg-background">
                        <section>
                            <h3 className="text-lg font-semibold border-b pb-2 mb-4 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Important Guidelines
                            </h3>
                            <ul className="space-y-3 text-muted-foreground leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span>You have exactly <strong>{subject.duration_minutes} minutes</strong> to complete this examination. The timer will begin immediately after you click start.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span>Do not close your browser or navigate away from the exam page. Your session is monitored.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span>Your answers are automatically saved as you select them. You can safely change answers before the final submission.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                                    <span>When the timer reaches zero, your examination will be automatically submitted regardless of your progress.</span>
                                </li>
                            </ul>
                        </section>

                        {subject.instructions && (
                            <section>
                                <h3 className="text-lg font-semibold border-b pb-2 mb-4 text-primary">Specific Instructions</h3>
                                <div className="prose prose-sm max-w-none text-muted-foreground bg-muted/30 p-4 rounded-lg">
                                    {subject.instructions}
                                </div>
                            </section>
                        )}

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
                            <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold mb-1">Security Notice</p>
                                <p>Your account is locked to this specific device. Attempting to log in from another device during the exam will instantly terminate your session.</p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="bg-muted/30 p-6 flex flex-col items-center gap-6 border-t border-border/50">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center justify-center">
                                <input 
                                    type="checkbox" 
                                    className="peer sr-only" 
                                    checked={accepted}
                                    onChange={(e) => setAccepted(e.target.checked)}
                                />
                                <div className="h-6 w-6 rounded border-2 border-primary/50 bg-background peer-checked:bg-primary peer-checked:border-primary transition-colors" />
                                <CheckCircle2 className="absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-medium select-none group-hover:text-primary transition-colors">
                                I have read and understood the instructions. I am ready to begin.
                            </span>
                        </label>

                        <form onSubmit={startExam} className="w-full max-w-sm">
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-lg font-bold transition-all shadow-md" 
                                disabled={!accepted || processing}
                                size="lg"
                            >
                                {processing ? 'Initializing Exam...' : 'Start Examination'}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
