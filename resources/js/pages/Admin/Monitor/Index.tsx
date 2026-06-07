import { Head, router } from '@inertiajs/react';
import {
    MonitorPlay,
    Clock,
    SmartphoneNfc,
    AlertCircle,
    RefreshCw,
    LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ExamStatusBadge } from '@/components/admin/exam-status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

interface MonitorSession {
    id: number;
    candidate: {
        id: number;
        name: string;
        file_no: string;
    };
    subject: {
        id: number;
        name: string;
        code: string;
    };
    status: string;
    starts_at: string;
    expires_at: string | null;
    remaining_seconds: number;
    device_locked: boolean;
}

interface PageProps {
    sessions: MonitorSession[];
}

export default function MonitorIndex({ sessions: initialSessions }: PageProps) {
    const [sessions, setSessions] = useState<MonitorSession[]>(
        Array.isArray(initialSessions)
            ? initialSessions
            : Object.values(initialSessions || {}),
    );
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Update local countdown timers
    useEffect(() => {
        const timer = setInterval(() => {
            setSessions((prev) => {
                if (!Array.isArray(prev)) {
                    return prev;
                }

                return prev.map((s) => {
                    const currentRem = Number(s.remaining_seconds) || 0;

                    if (currentRem > 0) {
                        return { ...s, remaining_seconds: currentRem - 1 };
                    }

                    return s;
                });
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Sync from server when Inertia updates props
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSessions(
            Array.isArray(initialSessions)
                ? initialSessions
                : Object.values(initialSessions || {}),
        );
    }, [initialSessions]);

    // Optionally auto-refresh from server every 10 seconds
    useEffect(() => {
        const syncTimer = setInterval(() => {
            router.reload({
                only: ['sessions'],
                preserveState: true,
                preserveScroll: true,
                onSuccess: (page) => {
                    const newSessions = page.props.sessions;
                    setSessions(
                        Array.isArray(newSessions)
                            ? newSessions
                            : Object.values(newSessions || {}),
                    );
                },
            });
        }, 10000);

        return () => clearInterval(syncTimer);
    }, []);

    const formatTime = (seconds: number) => {
        if (seconds <= 0) {
            return '00:00';
        }

        const m = Math.floor(seconds / 60);
        const s = seconds % 60;

        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleReleaseDevice = (candidateId: number) => {
        if (
            confirm(
                'Are you sure you want to release this device lock? The candidate will be forcefully logged out.',
            )
        ) {
            router.post(
                `/admin/monitor/release-device/${candidateId}`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        toast.success('Device released successfully.'),
                },
            );
        }
    };

    const handleForceSubmit = (sessionId: number) => {
        if (
            confirm(
                'Force submit this exam session? The exam will be ended immediately.',
            )
        ) {
            router.post(
                `/admin/monitor/force-submit/${sessionId}`,
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => toast.success('Session force submitted.'),
                },
            );
        }
    };

    const handleExtendTime = (sessionId: number, minutes: number = 10) => {
        if (confirm(`Add ${minutes} minutes to this session?`)) {
            router.post(
                `/admin/monitor/extend-time/${sessionId}`,
                { minutes },
                {
                    preserveScroll: true,
                    onSuccess: () =>
                        toast.success(`Added ${minutes} minutes to session.`),
                },
            );
        }
    };

    const refreshNow = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['sessions'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    return (
        <>
            <Head title="Live Exam Monitor" />

            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            Live Monitor
                        </h1>
                        <p className="text-muted-foreground">
                            Watch and manage active candidate exam sessions in
                            real-time.
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshNow}
                        disabled={isRefreshing}
                    >
                        <RefreshCw
                            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        Refresh
                    </Button>
                </div>

                <Card>
                    <CardHeader className="border-b border-border/50 pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <MonitorPlay className="h-5 w-5 text-primary" />
                            Active Sessions ({sessions.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Subject</TableHead>
                                    <TableHead className="text-center">
                                        Time Left
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Status
                                    </TableHead>
                                    <TableHead className="text-center">
                                        Device
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sessions.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={6}
                                            className="h-32 text-center text-muted-foreground"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <AlertCircle className="h-8 w-8 opacity-20" />
                                                <p>No active sessions found.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    sessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {session.candidate.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {session.candidate.file_no}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">
                                                    {session.subject.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {session.subject.code}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span
                                                    className={`font-mono text-sm font-medium ${session.remaining_seconds < 300 ? 'font-bold text-destructive' : ''}`}
                                                >
                                                    {formatTime(
                                                        session.remaining_seconds,
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <ExamStatusBadge
                                                    status={session.status}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {session.device_locked ? (
                                                    <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                        <SmartphoneNfc className="mr-1 h-3 w-3" />{' '}
                                                        Locked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-muted-foreground">
                                                        Free
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {session.device_locked && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() =>
                                                                handleReleaseDevice(
                                                                    session
                                                                        .candidate
                                                                        .id,
                                                                )
                                                            }
                                                            title="Release Device Lock"
                                                        >
                                                            <LogOut className="h-4 w-4 text-amber-600" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleExtendTime(
                                                                session.id,
                                                                10,
                                                            )
                                                        }
                                                        title="Add 10 Minutes"
                                                    >
                                                        <Clock className="h-4 w-4 text-green-600" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() =>
                                                            handleForceSubmit(
                                                                session.id,
                                                            )
                                                        }
                                                        title="Force Submit"
                                                    >
                                                        Submit
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

MonitorIndex.layout = {
    breadcrumbs: [
        {
            title: 'Live Monitor',
            href: '/admin/monitor',
        },
    ],
};
