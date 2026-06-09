import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Role {
    id: number;
    name: string;
    permissions: { id: number; name: string }[];
}

interface RolesProps {
    roles: Role[];
}

export default function RolesIndex({ roles }: RolesProps) {
    return (
        <>
            <Head title="Manage Roles" />
            
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
                        <p className="text-muted-foreground mt-1">Manage system roles and their permissions.</p>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Role
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Roles List</CardTitle>
                        <CardDescription>Roles define what actions a user can perform in the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Role Name</TableHead>
                                        <TableHead>Permissions</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {roles.map((role) => (
                                        <TableRow key={role.id}>
                                            <TableCell className="font-medium">{role.name}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap max-w-xl">
                                                    {role.permissions.map((perm) => (
                                                        <Badge key={perm.id} variant="outline" className="text-xs">
                                                            {perm.name}
                                                        </Badge>
                                                    ))}
                                                    {role.permissions.length === 0 && <span className="text-muted-foreground text-sm">None</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" title="Edit Role">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" title="Delete Role">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {roles.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                                No roles found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
