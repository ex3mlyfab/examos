<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ExamSeason;
use App\Models\Subject;
use App\Models\Question;
use App\Models\Candidate;
use App\Models\User;
use App\Models\CandidateExamSession;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use App\Services\CredentialGeneratorService;
use App\Services\ExamSessionService;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::first() ?? User::factory()->create(['name' => 'Admin', 'email' => 'admin@example.com']);
        $credentialService = app(CredentialGeneratorService::class);
        $examSessionService = app(ExamSessionService::class);

        // ---------------------------------------------------------
        // 1. STANDARD EXAM SEASON
        // ---------------------------------------------------------
        $standardSeason = ExamSeason::create([
            'name' => '2026 Standard Examinations',
            'code' => 'STD-' . time(),
            'description' => 'A standard season with single subject execution.',
            'starts_at' => Carbon::now()->subDays(2),
            'ends_at' => Carbon::now()->addDays(5),
            'logout_grace_minutes' => 30,
            'status' => 'active',
            'exam_mode' => 'per_subject',
            'allow_result_review' => true,
            'created_by' => $admin->id,
        ]);

        $mathSubject = Subject::create([
            'exam_season_id' => $standardSeason->id,
            'name' => 'Mathematics',
            'code' => 'MTH-101',
            'duration_minutes' => 60,
            'questions_per_page' => 1,
            'total_questions_to_display' => 5,
            'pass_mark' => 50,
            'instructions' => 'Calculators are allowed. Do your best.',
            'allocation_criteria' => ['department' => 'Science'],
            'is_active' => true,
        ]);

        $this->seedQuestions($mathSubject, 'Mathematics', $admin->id);
        $stdCandidates = $this->seedCandidates(2, $standardSeason, [$mathSubject], $credentialService, 'STD');

        // Simulate 1 candidate completed
        $session1 = $examSessionService->startOrResume($stdCandidates[0], $mathSubject);
        foreach ($session1->question_order as $idx => $qId) {
            $options = Question::find($qId)->options;
            // Answer correctly mostly
            $optionId = $idx < 4 ? $options->where('is_correct', true)->first()->id : $options->where('is_correct', false)->first()->id;
            $examSessionService->saveAnswer($session1, $qId, $optionId);
        }
        $examSessionService->submit($session1);

        // Simulate 1 candidate active
        $examSessionService->startOrResume($stdCandidates[1], $mathSubject);

        $this->command->info('Seeded Standard Exam Season.');

        // ---------------------------------------------------------
        // 2. COMBO EXAM SEASON
        // ---------------------------------------------------------
        $comboSeason = ExamSeason::create([
            'name' => '2026 Combo Entrance Exams',
            'code' => 'CMB-' . time(),
            'description' => 'A combo season testing multiple subjects seamlessly.',
            'starts_at' => Carbon::now()->subDays(1),
            'ends_at' => Carbon::now()->addDays(6),
            'logout_grace_minutes' => 30,
            'status' => 'active',
            'exam_mode' => 'combined',
            'combo_settings' => [
                'mode' => 'sequential',
                'auto_switch' => true
            ],
            'allow_result_review' => true,
            'created_by' => $admin->id,
        ]);

        $engSubject = Subject::create([
            'exam_season_id' => $comboSeason->id,
            'name' => 'English Language',
            'code' => 'ENG-101',
            'duration_minutes' => 30,
            'questions_per_page' => 1,
            'total_questions_to_display' => 5,
            'pass_mark' => 50,
            'instructions' => 'Choose the most appropriate option.',
            'allocation_criteria' => ['department' => 'All'],
            'is_active' => true,
        ]);

        $gkSubject = Subject::create([
            'exam_season_id' => $comboSeason->id,
            'name' => 'General Knowledge',
            'code' => 'GK-101',
            'duration_minutes' => 20,
            'questions_per_page' => 1,
            'total_questions_to_display' => 5,
            'pass_mark' => 40,
            'instructions' => 'General questions about the world.',
            'allocation_criteria' => ['department' => 'All'],
            'is_active' => true,
        ]);

        $this->seedQuestions($engSubject, 'English', $admin->id);
        $this->seedQuestions($gkSubject, 'General Knowledge', $admin->id);

        $cmbCandidates = $this->seedCandidates(3, $comboSeason, [$engSubject, $gkSubject], $credentialService, 'CMB');

        // Candidate 1: Finished both subjects
        $c1Eng = $examSessionService->startOrResume($cmbCandidates[0], $engSubject);
        $this->simulateAnswers($c1Eng, $examSessionService, true); // Passed
        $c1Gk = $examSessionService->startOrResume($cmbCandidates[0], $gkSubject);
        $this->simulateAnswers($c1Gk, $examSessionService, true); // Passed

        // Candidate 2: Finished English, Active in GK
        $c2Eng = $examSessionService->startOrResume($cmbCandidates[1], $engSubject);
        $this->simulateAnswers($c2Eng, $examSessionService, false); // Failed
        $c2Gk = $examSessionService->startOrResume($cmbCandidates[1], $gkSubject);
        // Active, no answers submitted yet.

        // Candidate 3: Not started

        $this->command->info('Seeded Combo Exam Season with Results.');

        $this->command->line("");
        $this->command->info("========================================");
        $this->command->info("TEST CANDIDATE CREDENTIALS:");
        foreach (array_merge($stdCandidates, $cmbCandidates) as $c) {
            $this->command->line("Season:   {$c->examSeason->name}");
            $this->command->line("Name:     {$c->name}");
            $this->command->line("File No:  {$c->file_no}");
            $this->command->line("Password: {$c->raw_password}");
            $this->command->line("----------------------------------------");
        }
    }

    private function seedQuestions(Subject $subject, string $topic, int $adminId)
    {
        for ($i = 1; $i <= 5; $i++) {
            $question = Question::create([
                'subject_id' => $subject->id,
                'question_text' => "Sample {$topic} Question {$i}?",
                'question_type' => 'single_choice',
                'marks' => 10,
                'is_active' => true,
                'created_by' => $adminId,
            ]);

            $correctIndex = rand(0, 3);
            foreach (['A', 'B', 'C', 'D'] as $idx => $label) {
                $question->options()->create([
                    'option_text' => "Option {$label} for Q{$i}",
                    'is_correct' => ($idx === $correctIndex),
                    'option_label' => $label,
                ]);
            }
        }
    }

    private function seedCandidates(int $count, ExamSeason $season, array $subjects, CredentialGeneratorService $service, string $prefix)
    {
        $candidates = [];
        for ($i = 1; $i <= $count; $i++) {
            $firstName = "Test{$prefix}User{$i}";
            $fileNo = $prefix . '-' . str_pad((string)rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            $rawPassword = $service->generatePassword($firstName, $fileNo);

            $candidate = Candidate::create([
                'file_no' => $fileNo,
                'name' => "{$firstName} Doe",
                'email' => strtolower($firstName) . '_' . time() . "@example.com",
                'department' => 'Science',
                'level' => '100',
                'password' => Hash::make($rawPassword),
                'raw_password' => $rawPassword,
                'exam_season_id' => $season->id,
                'is_active' => true,
            ]);
            
            foreach ($subjects as $subject) {
                $candidate->subjects()->attach($subject->id, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            $candidates[] = $candidate;
        }
        return $candidates;
    }

    private function simulateAnswers($session, ExamSessionService $service, bool $pass)
    {
        foreach ($session->question_order as $idx => $qId) {
            $options = Question::find($qId)->options;
            if ($pass) {
                $optionId = $idx < 4 ? $options->where('is_correct', true)->first()->id : $options->where('is_correct', false)->first()->id;
            } else {
                $optionId = $idx < 1 ? $options->where('is_correct', true)->first()->id : $options->where('is_correct', false)->first()->id;
            }
            $service->saveAnswer($session, $qId, $optionId);
        }
        $service->submit($session);
    }
}
