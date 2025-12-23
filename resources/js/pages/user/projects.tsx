import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Edit2, FileJson, FolderOpen, Loader2, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Projects', href: '/projects' },
];

interface Project {
    id: number;
    name: string;
    description: string | null;
    thumbnail: string | null;
    rooms: any[];
    placements: any[];
    room_designs: Record<string, any>;
    created_at: string;
    updated_at: string;
}

interface Props {
    projects: Project[];
}

export default function Projects({ projects }: Props) {
    const [selectedProjects, setSelectedProjects] = useState<number[]>([]);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateArea = (rooms: any[]) => {
        if (!rooms || rooms.length === 0) return '0 m²';
        const totalArea = rooms.reduce((sum, room) => {
            const width = room.width / 100; // Convert to meters
            const height = room.height / 100;
            return sum + (width * height);
        }, 0);
        return `${totalArea.toFixed(2)} m²`;
    };

    const handleDelete = async (projectId: number) => {
        if (!confirm('Are you sure you want to delete this project?')) return;
        
        setDeletingId(projectId);
        try {
            const response = await fetch(`/api/interior-projects/${projectId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Failed to delete project:', error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleExportJSON = (project: Project) => {
        const exportData = {
            name: project.name,
            description: project.description,
            rooms: project.rooms,
            placements: project.placements,
            roomDesigns: project.room_designs,
            exportedAt: new Date().toISOString(),
        };
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Projects" />
            
            <div className="min-h-screen bg-gradient-to-br from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50">
                <div className="mx-auto max-w-7xl px-6 py-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
                                My Projects
                            </h1>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                                Manage and organize all your design projects
                            </p>
                        </div>
                        <Link
                            href="/interior-design"
                            className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition-colors shadow-lg"
                        >
                            <Plus className="h-5 w-5" />
                            New Project
                        </Link>
                    </div>

                    {/* Empty State */}
                    {projects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="mb-4 rounded-full bg-zinc-100 p-4 dark:bg-zinc-800">
                                <FolderOpen className="h-12 w-12 text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">No projects yet</h3>
                            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                                Create your first interior design project to get started.
                            </p>
                            <Link
                                href="/interior-design"
                                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Create Project
                            </Link>
                        </div>
                    ) : (
                        <>
                            {/* Projects Table */}
                            <div className="rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/50">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="border-b border-zinc-200 dark:border-zinc-800">
                                            <tr className="bg-zinc-50 dark:bg-zinc-800/50">
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedProjects(projects.map((p) => p.id));
                                                            } else {
                                                                setSelectedProjects([]);
                                                            }
                                                        }}
                                                        className="rounded border-zinc-300"
                                                    />
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Project Name
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Rooms
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Total Area
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Items
                                                </th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Last Updated
                                                </th>
                                                <th className="px-6 py-4 text-right text-sm font-semibold text-zinc-900 dark:text-white">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                                            {projects.map((project) => (
                                                <tr
                                                    key={project.id}
                                                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedProjects.includes(project.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedProjects([...selectedProjects, project.id]);
                                                                } else {
                                                                    setSelectedProjects(
                                                                        selectedProjects.filter((id) => id !== project.id)
                                                                    );
                                                                }
                                                            }}
                                                            className="rounded border-zinc-300"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-orange-200 to-pink-200 dark:from-orange-900/40 dark:to-pink-900/40 flex items-center justify-center">
                                                                <FolderOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                                            </div>
                                                            <div>
                                                                <Link 
                                                                    href={`/interior-design/${project.id}`}
                                                                    className="font-medium text-zinc-900 dark:text-white hover:text-orange-500 dark:hover:text-orange-400"
                                                                >
                                                                    {project.name}
                                                                </Link>
                                                                {project.description && (
                                                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-xs">
                                                                        {project.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                                                        {project.rooms?.length || 0} rooms
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                                                        {calculateArea(project.rooms)}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                                                        {project.placements?.length || 0} items
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                                                        {formatDate(project.updated_at)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Link 
                                                                href={`/interior-design/${project.id}`}
                                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" 
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                                            </Link>
                                                            <button 
                                                                onClick={() => handleExportJSON(project)}
                                                                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors" 
                                                                title="Export JSON"
                                                            >
                                                                <FileJson className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDelete(project.id)}
                                                                disabled={deletingId === project.id}
                                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors disabled:opacity-50" 
                                                                title="Delete"
                                                            >
                                                                {deletingId === project.id ? (
                                                                    <Loader2 className="h-4 w-4 text-red-600 dark:text-red-400 animate-spin" />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Pagination */}
                            <div className="mt-8 flex items-center justify-between">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
