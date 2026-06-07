import { Head, useForm, Link } from '@inertiajs/react';
import { BookOpen, ShieldCheck, ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        file_no: '',
        password: '',
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post('/candidate/login');
    };

    return (
        <div className="flex min-h-screen bg-background font-sans selection:bg-primary/20">
            <Head title="Candidate Portal - Login" />

            {/* Left Side: Branding / Visuals (Hidden on small screens) */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:w-1/2">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] h-[120%] w-[120%] bg-gradient-to-br from-primary via-blue-600 to-indigo-900 opacity-90 mix-blend-multiply"></div>
                    <div className="animate-blob absolute top-20 left-20 h-96 w-96 rounded-full bg-white opacity-20 mix-blend-overlay blur-3xl filter"></div>
                    <div className="animate-blob animation-delay-2000 absolute right-20 bottom-20 h-96 w-96 rounded-full bg-cyan-300 opacity-20 mix-blend-overlay blur-3xl filter"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-lg">
                        <BookOpen className="h-7 w-7" />
                    </div>
                    <span className="text-3xl font-extrabold tracking-tight">
                        ExamOS
                    </span>
                </div>

                <div className="animate-fade-in relative z-10 mb-20">
                    <h1 className="mb-6 text-5xl leading-tight font-bold">
                        Secure.
                        <br />
                        Seamless.
                        <br />
                        Reliable.
                    </h1>
                    <p className="max-w-md text-xl leading-relaxed text-primary-foreground/80">
                        Welcome to your unified assessment portal. Log in to
                        access your designated examination sessions.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-sm text-primary-foreground/60">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Protected by Enterprise-Grade Security</span>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="relative flex w-full flex-col items-center justify-center p-8 sm:p-12 lg:w-1/2 xl:p-24">
                {/* Back Link */}
                <div className="absolute top-8 left-8">
                    <Button
                        variant="ghost"
                        asChild
                        className="group text-muted-foreground hover:text-foreground"
                    >
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                <div className="animate-fade-in w-full max-w-md">
                    <div className="mb-10 flex items-center justify-center gap-2 text-primary lg:hidden">
                        <BookOpen className="h-8 w-8" />
                        <span className="text-2xl font-bold tracking-tight">
                            ExamOS
                        </span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="mb-2 text-3xl font-bold tracking-tight">
                            Candidate Portal
                        </h2>
                        <p className="text-muted-foreground">
                            Sign in to begin your examination.
                        </p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="file_no">
                                File Number / Username
                            </Label>
                            <Input
                                id="file_no"
                                type="text"
                                placeholder="e.g. COMP/2026/001"
                                value={data.file_no}
                                className="h-12 bg-background text-base transition-colors focus:bg-background"
                                onChange={(e) =>
                                    setData('file_no', e.target.value)
                                }
                                autoFocus
                            />
                            {errors.file_no && (
                                <p className="mt-1 text-sm font-medium text-destructive">
                                    {errors.file_no}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">
                                Access Code / Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                className="h-12 bg-background text-base tracking-widest transition-colors focus:bg-background"
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                            />
                            {errors.password && (
                                <p className="mt-1 text-sm font-medium text-destructive">
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 h-12 w-full text-lg font-medium shadow-md transition-all hover:scale-[1.02]"
                            disabled={processing}
                        >
                            {processing
                                ? 'Authenticating...'
                                : 'Sign In to Dashboard'}
                        </Button>
                    </form>

                    <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
                        Having trouble logging in? <br className="sm:hidden" />
                        Please contact the invigilator immediately.
                    </div>
                </div>
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
            `}</style>
        </div>
    );
}
