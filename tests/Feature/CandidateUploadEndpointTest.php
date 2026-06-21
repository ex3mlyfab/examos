<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\ExamSeason;
use App\Models\Candidate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class CandidateUploadEndpointTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_validation_errors()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->post(route('admin.candidates.import'), []);
        $response->assertSessionHasErrors(['exam_season_id', 'file']);
    }

    public function test_import_invalid_file_extension()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $season = ExamSeason::create([
            'name' => 'Test Season',
            'code' => 'TEST-SEASON-1',
            'status' => 'draft',
            'starts_at' => now(),
            'ends_at' => now()->addDays(7),
            'exam_mode' => 'per_subject',
            'created_by' => $user->id,
        ]);

        $file = UploadedFile::fake()->create('candidates.pdf', 100);

        $response = $this->post(route('admin.candidates.import'), [
            'exam_season_id' => $season->id,
            'file' => $file,
        ]);

        $response->assertSessionHasErrors(['file']);
    }

    public function test_import_successful_csv()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $season = ExamSeason::create([
            'name' => 'Test Season',
            'code' => 'TEST-SEASON-2',
            'status' => 'draft',
            'starts_at' => now(),
            'ends_at' => now()->addDays(7),
            'exam_mode' => 'per_subject',
            'created_by' => $user->id,
        ]);

        // Create a fake CSV with matching heading keys for CandidatesImport
        $csvContent = "file_no,name,telephone,email,gender,department,level\n";
        $csvContent .= "12345,John Doe,1234567890,john@example.com,M,Science,100\n";
        
        $file = UploadedFile::fake()->createWithContent('candidates.csv', $csvContent);

        $response = $this->post(route('admin.candidates.import'), [
            'exam_season_id' => $season->id,
            'file' => $file,
        ]);

        $response->assertRedirect(route('admin.candidates.index'));
        $this->assertDatabaseHas('candidates', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'exam_season_id' => $season->id,
        ]);
    }
}
