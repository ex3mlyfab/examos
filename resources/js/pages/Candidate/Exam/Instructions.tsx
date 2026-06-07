import { Head, Link, useForm } from '@inertiajs/react';
import {
    Clock,
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ShieldAlert,
} from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import type { Subject } from '@/types/exam';

export default function Instructions({ subject }: { subject: Subject }) {
    const { post, processing } = useForm();
    const [accepted, setAccepted] = useState(false);

    const startExam = (e: FormEvent) => {
        e.preventDefault();

        if (!accepted) {
            return;
        }

        post(`/candidate/start/${subject.id}`);
    };

    return (
        <div className="min-h-screen bg-muted/20 px-4 py-8 font-sans sm:px-6">
            <Head title={`Instructions - ${subject.name}`} />

            <div className="mx-auto max-w-3xl space-y-6">
                <Link
                    href="/candidate/profile"
                    className="inline-flex items-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Back to Dashboard
                </Link>

                <Card className="overflow-hidden border-0 shadow-lg ring-1 ring-primary/10">
                    <div className="flex flex-col justify-between gap-4 bg-primary p-6 text-primary-foreground md:flex-row md:items-center">
                        <div>
                            <h1 className="text-2xl font-bold">
                                {subject.name}
                            </h1>
                            <p className="mt-1 font-mono text-primary-foreground/80">
                                {subject.code}
                            </p>
                        </div>
                        <div className="flex w-fit items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 backdrop-blur-sm">
                            <Clock className="h-5 w-5" />
                            <span className="font-bold">
                                {subject.duration_minutes} Minutes
                            </span>
                        </div>
                    </div>

                    <CardContent className="space-y-8 bg-background p-6 md:p-8">
                        <section>
                            <h3 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-semibold">
                                <AlertTriangle className="h-5 w-5 text-amber-500" />
                                Important Guidelines
                            </h3>
                            <ul className="space-y-3 leading-relaxed text-muted-foreground">
                                <li className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                    <span>
                                        You have exactly{' '}
                                        <strong>
                                            {subject.duration_minutes} minutes
                                        </strong>{' '}
                                        to complete this examination. The timer
                                        will begin immediately after you click
                                        start.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                    <span>
                                        Do not close your browser or navigate
                                        away from the exam page. Your session is
                                        monitored.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                    <span>
                                        Your answers are automatically saved as
                                        you select them. You can safely change
                                        answers before the final submission.
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                                    <span>
                                        When the timer reaches zero, your
                                        examination will be automatically
                                        submitted regardless of your progress.
                                    </span>
                                </li>
                            </ul>
                        </section>

                        {subject.instructions && (
                            <section>
                                <h3 className="mb-4 border-b pb-2 text-lg font-semibold text-primary">
                                    Specific Instructions
                                </h3>
                                <div className="prose prose-sm max-w-none rounded-lg bg-muted/30 p-4 text-muted-foreground">
                                    {subject.instructions}
                                </div>
                            </section>
                        )}

                        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <ShieldAlert className="mt-0.5 h-5 w-5 flex-shrink-0" />
                            <div>
                                <p className="mb-1 font-semibold">
                                    Security Notice
                                </p>
                                <p>
                                    Your account is locked to this specific
                                    device. Attempting to log in from another
                                    device during the exam will instantly
                                    terminate your session.
                                </p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col items-center gap-6 border-t border-border/50 bg-muted/30 p-6">
                        <label className="group flex cursor-pointer items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    className="peer sr-only"
                                    checked={accepted}
                                    onChange={(e) =>
                                        setAccepted(e.target.checked)
                                    }
                                />
                                <div className="h-6 w-6 rounded border-2 border-primary/50 bg-background transition-colors peer-checked:border-primary peer-checked:bg-primary" />
                                <CheckCircle2 className="absolute h-4 w-4 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
                            </div>
                            <span className="font-medium transition-colors select-none group-hover:text-primary">
                                I have read and understood the instructions. I
                                am ready to begin.
                            </span>
                        </label>

                        <form onSubmit={startExam} className="w-full max-w-sm">
                            <Button
                                type="submit"
                                className="h-12 w-full text-lg font-bold shadow-md transition-all"
                                disabled={!accepted || processing}
                                size="lg"
                            >
                                {processing
                                    ? 'Initializing Exam...'
                                    : 'Start Examination'}
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
