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
            <div className="hidden lg:flex lg:w-1/2 relative bg-primary flex-col justify-between overflow-hidden p-12 text-primary-foreground">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-primary via-blue-600 to-indigo-900 opacity-90 mix-blend-multiply"></div>
                    <div className="absolute top-20 left-20 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-300 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-primary shadow-lg">
                        <BookOpen className="h-7 w-7" />
                    </div>
                    <span className="text-3xl font-extrabold tracking-tight">ExamOS</span>
                </div>

                <div className="relative z-10 mb-20 animate-fade-in">
                    <h1 className="text-5xl font-bold leading-tight mb-6">
                        Secure.<br />Seamless.<br />Reliable.
                    </h1>
                    <p className="text-xl text-primary-foreground/80 max-w-md leading-relaxed">
                        Welcome to your unified assessment portal. Log in to access your designated examination sessions.
                    </p>
                </div>
                
                <div className="relative z-10 flex items-center gap-2 text-primary-foreground/60 text-sm">
                    <ShieldCheck className="h-5 w-5" />
                    <span>Protected by Enterprise-Grade Security</span>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 sm:p-12 xl:p-24 relative">
                {/* Back Link */}
                <div className="absolute top-8 left-8">
                    <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground group">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                <div className="w-full max-w-md animate-fade-in">
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-10 text-primary">
                        <BookOpen className="h-8 w-8" />
                        <span className="text-2xl font-bold tracking-tight">ExamOS</span>
                    </div>

                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-3xl font-bold tracking-tight mb-2">Candidate Portal</h2>
                        <p className="text-muted-foreground">Sign in to begin your examination.</p>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="file_no">File Number / Username</Label>
                            <Input
                                id="file_no"
                                type="text"
                                placeholder="e.g. COMP/2026/001"
                                value={data.file_no}
                                className="h-12 bg-background focus:bg-background transition-colors text-base"
                                onChange={(e) => setData('file_no', e.target.value)}
                                autoFocus
                            />
                            {errors.file_no && <p className="text-sm font-medium text-destructive mt-1">{errors.file_no}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Access Code / Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={data.password}
                                className="h-12 bg-background focus:bg-background transition-colors text-base tracking-widest"
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <p className="text-sm font-medium text-destructive mt-1">{errors.password}</p>}
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg font-medium shadow-md transition-all hover:scale-[1.02] mt-4" disabled={processing}>
                            {processing ? 'Authenticating...' : 'Sign In to Dashboard'}
                        </Button>
                    </form>

                    <div className="mt-12 text-center text-sm text-muted-foreground border-t pt-8">
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
