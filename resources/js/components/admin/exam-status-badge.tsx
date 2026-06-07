import { Badge } from '@/components/ui/badge';

interface ExamStatusBadgeProps {
    status: 'draft' | 'active' | 'paused' | 'completed' | 'expired' | string;
    className?: string;
}

export function ExamStatusBadge({ status, className = '' }: ExamStatusBadgeProps) {
    let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'default';
    let label = status.charAt(0).toUpperCase() + status.slice(1);
    
    switch (status) {
        case 'active':
            return <Badge variant="default" className={`bg-green-600 hover:bg-green-700 ${className}`}>{label}</Badge>;
        case 'paused':
            return <Badge variant="outline" className={`text-amber-600 border-amber-600 ${className}`}>{label}</Badge>;
        case 'completed':
            return <Badge variant="secondary" className={`bg-gray-200 text-gray-800 ${className}`}>{label}</Badge>;
        case 'expired':
            return <Badge variant="destructive" className={className}>{label}</Badge>;
        case 'draft':
            return <Badge variant="outline" className={className}>{label}</Badge>;
        default:
            return <Badge variant="secondary" className={className}>{label}</Badge>;
    }
}
