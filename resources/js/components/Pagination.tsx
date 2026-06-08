import { Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    from?: number;
    to?: number;
    total?: number;
}

export default function Pagination({ links, from, to, total }: PaginationProps) {
    if (!links || links.length <= 3) return null;

    const cleanLabel = (label: string) => {
        if (label.includes('Previous')) {
            return (
                <span className="flex items-center gap-1">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                </span>
            );
        }
        if (label.includes('Next')) {
            return (
                <span className="flex items-center gap-1">
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </span>
            );
        }
        return label;
    };

    return (
        <div className="flex flex-col items-center justify-between gap-4 border-t border-muted py-4 px-1 sm:flex-row">
            <div className="text-sm text-muted-foreground">
                {from && to && total ? (
                    <>
                        Showing <span className="font-semibold text-foreground">{from}</span> to{' '}
                        <span className="font-semibold text-foreground">{to}</span> of{' '}
                        <span className="font-semibold text-foreground">{total}</span> results
                    </>
                ) : (
                    <span>Pagination</span>
                )}
            </div>

            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm bg-background" aria-label="Pagination">
                {links.map((link, idx) => {
                    const isPrevOrNext = link.label.includes('Previous') || link.label.includes('Next');
                    const baseClass = "relative inline-flex items-center text-sm font-medium transition-colors focus:z-20 focus:outline-offset-0";
                    const paddingClass = isPrevOrNext ? "px-3 py-2" : "px-4 py-2";
                    
                    let roundedClass = "";
                    if (idx === 0) roundedClass = "rounded-l-md border-l";
                    if (idx === links.length - 1) roundedClass = "rounded-r-md border-r";

                    if (!link.url) {
                        return (
                            <span
                                key={idx}
                                className={`${baseClass} ${paddingClass} ${roundedClass} border-y border-r border-muted text-muted-foreground opacity-40 cursor-not-allowed`}
                            >
                                {cleanLabel(link.label)}
                            </span>
                        );
                    }

                    return (
                        <Link
                            key={idx}
                            href={link.url}
                            className={`${baseClass} ${paddingClass} ${roundedClass} border-y border-r border-muted ${
                                link.active
                                    ? 'z-10 bg-primary text-primary-foreground hover:bg-primary/95 font-semibold'
                                    : 'text-foreground hover:bg-muted'
                            }`}
                        >
                            {cleanLabel(link.label)}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
