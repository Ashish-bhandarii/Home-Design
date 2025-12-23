<?php

namespace App\Http\Controllers;

use App\Models\InteriorDesignProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class InteriorDesignProjectController extends Controller
{
    /**
     * Get all projects for the authenticated user
     */
    public function index()
    {
        $projects = InteriorDesignProject::where('user_id', Auth::id())
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($projects);
    }

    /**
     * Get a specific project
     */
    public function show(InteriorDesignProject $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        return response()->json($project);
    }

    /**
     * Create a new project
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|string',
            'rooms' => 'required|array',
            'placements' => 'required|array',
            'room_designs' => 'nullable|array',
        ]);

        $project = InteriorDesignProject::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'thumbnail' => $validated['thumbnail'] ?? null,
            'rooms' => $validated['rooms'],
            'placements' => $validated['placements'],
            'room_designs' => $validated['room_designs'] ?? [],
        ]);

        return response()->json($project, 201);
    }

    /**
     * Update an existing project
     */
    public function update(Request $request, InteriorDesignProject $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|string',
            'rooms' => 'sometimes|required|array',
            'placements' => 'sometimes|required|array',
            'room_designs' => 'nullable|array',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    /**
     * Delete a project
     */
    public function destroy(InteriorDesignProject $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $project->delete();

        return response()->json(['message' => 'Project deleted successfully']);
    }

    /**
     * Duplicate a project
     */
    public function duplicate(InteriorDesignProject $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $newProject = InteriorDesignProject::create([
            'user_id' => Auth::id(),
            'name' => $project->name . ' (Copy)',
            'description' => $project->description,
            'thumbnail' => $project->thumbnail,
            'rooms' => $project->rooms,
            'placements' => $project->placements,
            'room_designs' => $project->room_designs,
        ]);

        return response()->json($newProject, 201);
    }
}
