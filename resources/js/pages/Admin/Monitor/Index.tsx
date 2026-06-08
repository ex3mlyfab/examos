import { Head, router } from '@inertiajs/react';
import {
    MonitorPlay,
    Clock,
    SmartphoneNfc,
    AlertCircle,
    RefreshCw,
    LogOut,
    Layers,
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

// ── Types ────────────────────────────────────────────────────────────────────

interface SubjectInfo {
    id: number;
    name: string;
    code: string;
    status?: string;
}

interface MonitorRow {
    id: number;
    session_ids: number[];
    candidate: {
        id: number;
        name: string;
        file_no: string;
    };
    is_combined: boolean;
    season_name: string | null;
    /** Populated for per-subject rows */
    subject: SubjectInfo | null;
    /** Populated for combined rows */
    subjects: SubjectInfo[];
    status: string;
    starts_at: string;
    expires_at: string | null;
    remaining_seconds: number;
    device_locked: boolean;
}

interface PageProps {
    rows: MonitorRow[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(seconds: number): string {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function normaliseRows(raw: MonitorRow[] | Record<string, MonitorRow>): MonitorRow[] {
    return Array.isArray(raw) ? raw : Object.values(raw ?? {});
}

// ── Component ────────────────────────────────────────────────────────────────

export default function MonitorIndex({ rows: initialRows }: PageProps) {
    const [rows, setRows] = useState<MonitorRow[]>(() => normaliseRows(initialRows));
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Tick local countdown every second
    useEffect(() => {
        const timer = setInterval(() => {
            setRows(prev =>
                prev.map(r => ({
                    ...r,
                    remaining_seconds: Math.max(0, (Number(r.remaining_seconds) || 0) - 1),
                })),
            );
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Sync whenever Inertia pushes new props (after actions / auto-refresh)
    useEffect(() => {
        setRows(normaliseRows(initialRows));
    }, [initialRows]);

    // Auto-refresh from server every 10 s
    useEffect(() => {
        const syncTimer = setInterval(() => {
            router.reload({
                only: ['rows'],
                onSuccess: page => setRows(normaliseRows((page.props as unknown as PageProps).rows)),
            });
        }, 10_000);
        return () => clearInterval(syncTimer);
    }, []);

    // ── Action handlers ───────────────────────────────────────────────────────

    const handleReleaseDevice = (candidateId: number) => {
        if (confirm('Release device lock? The candidate will be forcefully logged out.')) {
            router.post(
                `/admin/monitor/release-device/${candidateId}`,
                {},
                { preserveScroll: true, onSuccess: () => toast.success('Device released.') },
            );
        }
    };

    /** For single-subject rows */
    const handleForceSubmitSession = (sessionId: number) => {
        if (confirm('Force-submit this exam session? It will end immediately.')) {
            router.post(
                `/admin/monitor/force-submit/${sessionId}`,
                {},
                { preserveScroll: true, onSuccess: () => toast.success('Session force-submitted.') },
            );
        }
    };

    /** For combined rows – submits ALL subjects at once */
    const handleForceSubmitCandidate = (candidateId: number) => {
        if (confirm('Force-submit ALL subjects for this candidate? Every active session will end immediately.')) {
            router.post(
                `/admin/monitor/force-submit-candidate/${candidateId}`,
                {},
                { preserveScroll: true, onSuccess: () => toast.success('All combined sessions force-submitted.') },
            );
        }
    };

    /** For single-subject rows */
    const handleExtendTimeSession = (sessionId: number, minutes = 10) => {
        if (confirm(`Add ${minutes} minutes to this session?`)) {
            router.post(
                `/admin/monitor/extend-time/${sessionId}`,
                { minutes },
                { preserveScroll: true, onSuccess: () => toast.success(`Added ${minutes} min.`) },
            );
        }
    };

    /** For combined rows – extends ALL subjects at once */
    const handleExtendTimeCandidate = (candidateId: number, minutes = 10) => {
        if (confirm(`Add ${minutes} minutes to ALL subjects for this candidate?`)) {
            router.post(
                `/admin/monitor/extend-time-candidate/${candidateId}`,
                { minutes },
                { preserveScroll: true, onSuccess: () => toast.success(`Added ${minutes} min to all combined sessions.`) },
            );
        }
    };

    const refreshNow = () => {
        setIsRefreshing(true);
        router.reload({ only: ['rows'], onFinish: () => setIsRefreshing(false) });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <>
            <Head title="Live Exam Monitor" />

            <div className="mx-auto flex max-w-7xl flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Live Monitor</h1>
                        <p className="text-muted-foreground">
                            Watch and manage active candidate exam sessions in real-time.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={refreshNow} disabled={isRefreshing}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                {/* Table card */}
                <Card>
                    <CardHeader className="border-b border-border/50 pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                            <MonitorPlay className="h-5 w-5 text-primary" />
                            Active Candidates ({rows.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/30">
                                    <TableHead>Candidate</TableHead>
                                    <TableHead>Subject(s)</TableHead>
                                    <TableHead className="text-center">Time Left</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Device</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rows.length === 0 ? (
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
                                    rows.map(row => (
                                        <TableRow key={`${row.candidate.id}-${row.id}`}>
                                            {/* Candidate */}
                                            <TableCell>
                                                <div className="font-medium">{row.candidate.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {row.candidate.file_no}
                                                </div>
                                                {row.season_name && (
                                                    <div className="mt-0.5 text-xs text-muted-foreground/70">
                                                        {row.season_name}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* Subject(s) */}
                                            <TableCell>
                                                {row.is_combined ? (
                                                    <div className="flex flex-col gap-1">
                                                        {/* Combined badge */}
                                                        <span className="mb-1 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                                            <Layers className="h-3 w-3" />
                                                            Combined
                                                        </span>
                                                        {/* Subject pills */}
                                                        <div className="flex flex-wrap gap-1">
                                                            {row.subjects.map(s => (
                                                                <span
                                                                    key={s.id}
                                                                    title={s.name}
                                                                    className={`rounded border px-1.5 py-0.5 text-xs font-medium leading-none ${
                                                                        s.status === 'active'
                                                                            ? 'border-green-300 bg-green-50 text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300'
                                                                            : 'border-border bg-muted text-muted-foreground'
                                                                    }`}
                                                                >
                                                                    {s.code || s.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="font-medium">{row.subject?.name}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {row.subject?.code}
                                                        </div>
                                                    </>
                                                )}
                                            </TableCell>

                                            {/* Time left */}
                                            <TableCell className="text-center">
                                                <span
                                                    className={`font-mono text-sm font-medium ${
                                                        row.remaining_seconds < 300 && row.remaining_seconds > 0
                                                            ? 'font-bold text-destructive'
                                                            : ''
                                                    }`}
                                                >
                                                    {formatTime(row.remaining_seconds)}
                                                </span>
                                            </TableCell>

                                            {/* Status */}
                                            <TableCell className="text-center">
                                                <ExamStatusBadge status={row.status} />
                                            </TableCell>

                                            {/* Device */}
                                            <TableCell className="text-center">
                                                {row.device_locked ? (
                                                    <span className="inline-flex items-center justify-center rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                                                        <SmartphoneNfc className="mr-1 h-3 w-3" />
                                                        Locked
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-muted-foreground">
                                                        Free
                                                    </span>
                                                )}
                                            </TableCell>

                                            {/* Actions */}
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {row.device_locked && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleReleaseDevice(row.candidate.id)}
                                                            title="Release Device Lock"
                                                        >
                                                            <LogOut className="h-4 w-4 text-amber-600" />
                                                        </Button>
                                                    )}

                                                    {/* Extend time */}
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        title="Add 10 Minutes"
                                                        onClick={() =>
                                                            row.is_combined
                                                                ? handleExtendTimeCandidate(row.candidate.id, 10)
                                                                : handleExtendTimeSession(row.id, 10)
                                                        }
                                                    >
                                                        <Clock className="h-4 w-4 text-green-600" />
                                                    </Button>

                                                    {/* Force submit */}
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        title={row.is_combined ? 'Force Submit All Subjects' : 'Force Submit'}
                                                        onClick={() =>
                                                            row.is_combined
                                                                ? handleForceSubmitCandidate(row.candidate.id)
                                                                : handleForceSubmitSession(row.id)
                                                        }
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
