import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
}

interface PermissionsProps {
    permissions: Permission[];
}

export default function PermissionsIndex({ permissions }: PermissionsProps) {
    return (
        <>
            <Head title="Manage Permissions" />
            
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Permissions</h1>
                        <p className="text-muted-foreground mt-1">Manage granular system access permissions.</p>
                    </div>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Permission
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Permissions List</CardTitle>
                        <CardDescription>Permissions are usually managed by the system but can be viewed here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Permission Name</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {permissions.map((permission) => (
                                        <TableRow key={permission.id}>
                                            <TableCell className="font-medium">{permission.name}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="outline" size="icon" title="Edit Permission">
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" title="Delete Permission">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {permissions.length === 0 && (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center h-24 text-muted-foreground">
                                                No permissions found.
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
