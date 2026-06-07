import { Head, Link } from '@inertiajs/react';
import { BookOpen, User, ShieldCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Welcome({ auth }: { auth: any }) {
    return (
        <>
            <Head title="Welcome to ExamOS" />
            <div className="relative flex min-h-screen flex-col overflow-hidden bg-background font-sans selection:bg-primary/20">
                {/* Abstract Background Gradient & Shapes */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-0 -left-4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                    <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                    <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
                </div>

                {/* Navbar */}
                <header className="relative z-10 w-full px-8 py-6 flex items-center justify-between glassmorphism border-b-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                            <BookOpen className="h-6 w-6" />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-foreground">ExamOS</span>
                    </div>
                </header>

                {/* Main Hero Section */}
                <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
                    <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 mb-8 shadow-sm">
                        Welcome to the Next-Gen CBT Engine
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground max-w-4xl mb-6 leading-tight">
                        Smarter, Secure, and Seamless <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Examinations</span>
                    </h1>
                    
                    <p className="mt-4 text-xl text-muted-foreground max-w-2xl mb-12">
                        ExamOS provides a frictionless testing environment for candidates and powerful oversight tools for administrators.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                        {/* Candidate Card */}
                        <div className="glass-card hover-lift rounded-2xl p-8 flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                                <User className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Candidate Portal</h2>
                            <p className="text-muted-foreground mb-8">Access your assigned examinations, track your remaining time, and submit your answers securely.</p>
                            
                            <Button asChild className="w-full h-12 text-lg shadow-md group mt-auto">
                                <Link href="/candidate/login">
                                    Candidate Login
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>

                        {/* Admin Card */}
                        <div className="glass-card hover-lift rounded-2xl p-8 flex flex-col items-center text-center">
                            <div className="h-16 w-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mb-6">
                                <ShieldCheck className="h-8 w-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-3">Admin Portal</h2>
                            <p className="text-muted-foreground mb-8">Manage seasons, curate question banks, monitor live exams, and analyze detailed result metrics.</p>
                            
                            <Button asChild variant="outline" className="w-full h-12 text-lg shadow-sm group mt-auto border-2 hover:bg-primary/5">
                                <Link href="/login">
                                    Administrator Login
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </main>

                <footer className="relative z-10 py-6 text-center text-sm text-muted-foreground glassmorphism border-t-0 shadow-none">
                    &copy; {new Date().getFullYear()} ExamOS. Built for scale and reliability.
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
