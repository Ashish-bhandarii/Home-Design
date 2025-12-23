# Testing the Download Plan Feature

## Quick Start

Follow these steps to test the download functionality:

### Step 1: Add Sample Files

Run the seeder to add sample files to a home design:

```bash
php artisan db:seed --class=DesignFilesSeeder
```

This will:
- Find the first home design in your database
- Create sample design files (PDF plans, CAD files, renders, etc.)
- Generate dummy files for testing

### Step 2: Visit the Design Page

Navigate to the home design detail page:

```
http://127.0.0.1:8000/design-home/12
```

(Replace `12` with the actual ID of your home design)

### Step 3: Test the Download

You should see:

1. **Download Button** in the hero section (orange button at top)
2. **Available Downloads Section** showing:
   - List of all available files
   - File type, extension, and size
   - Download count (initially 0)
   - "Download All Files" button

3. Click either download button to get the ZIP file

### Step 4: Verify the Download

Check that:
- ✅ ZIP file downloads with name `{DesignName}_Plans.zip`
- ✅ ZIP contains all the design files
- ✅ Download counter increments on the page
- ✅ Files are named correctly (especially floor files)

## Manual Testing (Without Seeder)

If you prefer to add files manually:

### Via Tinker

```bash
php artisan tinker
```

```php
use App\Models\HomeDesign;
use App\Models\DesignFile;

// Get a home design
$design = HomeDesign::find(12);

// Create a file path (make sure the file exists in storage/app/public/)
// You can use any existing file from your storage

$design->files()->create([
    'file_type' => 'pdf',
    'title' => 'Test Floor Plan',
    'file_path' => 'path/to/your/file.pdf', // relative to storage/app/public/
    'file_extension' => 'pdf',
    'file_size' => filesize(storage_path('app/public/path/to/your/file.pdf')),
    'sort_order' => 1,
]);
```

### Via Database

You can also insert directly into the database:

```sql
INSERT INTO design_files (
    designable_id, 
    designable_type, 
    file_type, 
    title, 
    file_path, 
    file_extension, 
    file_size, 
    sort_order,
    created_at,
    updated_at
) VALUES (
    12, 
    'App\\Models\\HomeDesign', 
    'pdf', 
    'Sample Floor Plan', 
    'path/to/file.pdf', 
    'pdf', 
    1024000, 
    1,
    NOW(),
    NOW()
);
```

## Test Cases

### Test Case 1: Multiple Files
- Add 3-5 files of different types
- Download and verify all files are in the ZIP

### Test Case 2: No Files
- View a design with no files
- Verify "Available Downloads" section is hidden
- Verify download button shows but gives error when clicked

### Test Case 3: Download Counter
- Download plans multiple times
- Verify counter increments each time
- Refresh page to see updated count

### Test Case 4: File Types
Test different file types:
- ✅ PDF documents
- ✅ CAD files (.dwg, .dxf)
- ✅ Images (.jpg, .png)
- ✅ 3D models
- ✅ Videos

### Test Case 5: Large Files
- Add a larger file (10MB+)
- Verify download still works
- Check ZIP compression

### Test Case 6: Floor Design Files
Add files to floor designs:

```php
$floorDesign = $design->floorDesigns->first();
$floorDesign->files()->create([
    'file_type' => '2d_plan',
    'title' => 'Detailed Floor Plan',
    'file_path' => 'floors/floor-1-detailed.pdf',
    'file_extension' => 'pdf',
    'file_size' => 1024000,
    'sort_order' => 1,
]);
```

Verify floor files are included in the ZIP with proper naming.

## Expected Behavior

### On Page Load:
- If files exist → Show "Available Downloads" section
- If no files → Section is hidden
- Download counter shows correct number

### On Download Click:
1. Browser initiates file download
2. Download counter increments by 1
3. ZIP file is downloaded with correct name
4. ZIP contains all files
5. Temporary ZIP is deleted from server

### Error Scenarios:

**No files available:**
- Redirect back with message: "No downloadable files available for this design."

**Inactive design:**
- 404 error page

**ZIP creation fails:**
- Redirect back with message: "Failed to create download archive."

## Troubleshooting

### Files not downloading?
- Check file paths exist in `storage/app/public/`
- Verify file permissions (should be readable)
- Check PHP ZIP extension is enabled: `php -m | grep zip`

### Download counter not incrementing?
- Check database has `downloads` column in `home_designs` table
- Verify column is fillable or not guarded

### ZIP is empty?
- Check file paths are correct
- Verify files exist using: `Storage::disk('public')->exists('path/to/file')`

### "Available Downloads" section not showing?
- Check `design_files` are being loaded in controller
- Verify relationship is working: `$design->files`
- Check browser console for JavaScript errors

## Clean Up

To remove test files:

```bash
php artisan tinker
```

```php
use App\Models\DesignFile;

// Delete all design files for a specific design
DesignFile::where('designable_id', 12)
    ->where('designable_type', 'App\\Models\\HomeDesign')
    ->delete();

// Or delete sample files directory
Storage::disk('public')->deleteDirectory('sample-files');
```

## Next Steps

After testing, you might want to:
1. Add file upload functionality in admin panel
2. Implement file preview for certain types
3. Add individual file downloads (not just ZIP)
4. Set up file versioning
5. Add download limits or premium access
