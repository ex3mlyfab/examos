import { Head, Link } from '@inertiajs/react';
import { BookOpen, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome() {
    return (
        <>
            <Head title="Welcome to ExamOS" />
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-background font-sans selection:bg-primary/20">
                {/* Abstract Background Gradient & Shapes */}
                <div className="absolute inset-0 z-0">
                    <div className="animate-blob absolute top-0 -left-4 h-72 w-72 rounded-full bg-primary opacity-30 mix-blend-multiply blur-3xl filter"></div>
                    <div className="animate-blob animation-delay-2000 absolute top-0 -right-4 h-72 w-72 rounded-full bg-blue-400 opacity-30 mix-blend-multiply blur-3xl filter"></div>
                    <div className="animate-blob animation-delay-4000 absolute -bottom-8 left-20 h-72 w-72 rounded-full bg-indigo-500 opacity-30 mix-blend-multiply blur-3xl filter"></div>
                </div>

                {/* Navbar */}
                <header className="glassmorphism relative z-10 flex w-full items-center justify-between border-b-0 px-8 py-6 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-foreground">
                            ExamOS
                        </span>
                    </div>
                </header>

                {/* Main Hero Section */}
                <main className="animate-fade-in relative z-10 flex flex-grow flex-col items-center justify-center px-6 py-20 text-center">
                    <div className="mb-8 inline-flex items-center rounded-full border border-transparent bg-secondary px-4 py-1.5 text-sm font-semibold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-none">
                        Welcome to the Next-Gen CBT Engine
                    </div>

                    <h1 className="mb-6 max-w-4xl text-5xl leading-tight font-extrabold tracking-tight text-foreground md:text-7xl">
                        Smarter, Secure, and Seamless{' '}
                        <span className="bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
                            Examinations
                        </span>
                    </h1>

                    <p className="mt-4 mb-12 max-w-2xl text-xl text-muted-foreground">
                        ExamOS provides a frictionless testing environment for
                        candidates and powerful oversight tools for
                        administrators.
                    </p>

                    <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
                        {/* Candidate Card */}
                        <div className="glass-card hover-lift flex flex-col items-center rounded-2xl p-8 text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                                <User className="h-8 w-8" />
                            </div>
                            <h2 className="mb-3 text-2xl font-bold">
                                Candidate Portal
                            </h2>
                            <p className="mb-8 text-muted-foreground">
                                Access your assigned examinations, track your
                                remaining time, and submit your answers
                                securely.
                            </p>

                            <Button
                                asChild
                                className="group mt-auto h-12 w-full text-lg shadow-md"
                            >
                                <Link href="/candidate/login">
                                    Candidate Login
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>

                        {/* Admin Card */}
                        <div className="glass-card hover-lift flex flex-col items-center rounded-2xl p-8 text-center">
                            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h2 className="mb-3 text-2xl font-bold">
                                Admin Portal
                            </h2>
                            <p className="mb-8 text-muted-foreground">
                                Manage seasons, curate question banks, monitor
                                live exams, and analyze detailed result metrics.
                            </p>

                            <Button
                                asChild
                                variant="outline"
                                className="group mt-auto h-12 w-full border-2 text-lg shadow-sm hover:bg-primary/5"
                            >
                                <Link href="/login">
                                    Administrator Login
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </main>

                <footer className="glassmorphism relative z-10 border-t-0 py-6 text-center text-sm text-muted-foreground shadow-none">
                    &copy; {new Date().getFullYear()} ExamOS. Built for scale
                    and reliability.
                </footer>
            </div>

            <style>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}
