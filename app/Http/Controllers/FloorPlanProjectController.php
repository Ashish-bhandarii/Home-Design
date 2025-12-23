<?php

namespace App\Http\Controllers;

use App\Models\FloorPlanProject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FloorPlanProjectController extends Controller
{
    /**
     * Get all projects for the authenticated user
     */
    public function index()
    {
        $projects = FloorPlanProject::where('user_id', Auth::id())
            ->orderBy('updated_at', 'desc')
            ->get();

        return response()->json($projects);
    }

    /**
     * Get a specific project
     */
    public function show(FloorPlanProject $project)
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
            'requirements' => 'required|array',
            'generated_plans' => 'nullable|array',
            'selected_plan_index' => 'nullable|integer',
        ]);

        $project = FloorPlanProject::create([
            'user_id' => Auth::id(),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'thumbnail' => $validated['thumbnail'] ?? null,
            'requirements' => $validated['requirements'],
            'generated_plans' => $validated['generated_plans'] ?? null,
            'selected_plan_index' => $validated['selected_plan_index'] ?? 0,
        ]);

        return response()->json($project, 201);
    }

    /**
     * Update an existing project
     */
    public function update(Request $request, FloorPlanProject $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|string',
            'requirements' => 'sometimes|required|array',
            'generated_plans' => 'nullable|array',
            'selected_plan_index' => 'nullable|integer',
        ]);

        $project->update($validated);

        return response()->json($project);
    }

    /**
     * Delete a project
     */
    public function destroy(FloorPlanProject $project)
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
    public function duplicate(FloorPlanProject $project)
    {
        // Ensure user owns the project
        if ($project->user_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $newProject = FloorPlanProject::create([
            'user_id' => Auth::id(),
            'name' => $project->name . ' (Copy)',
            'description' => $project->description,
            'thumbnail' => $project->thumbnail,
            'requirements' => $project->requirements,
            'generated_plans' => $project->generated_plans,
            'selected_plan_index' => $project->selected_plan_index,
        ]);

        return response()->json($newProject, 201);
    }
}
