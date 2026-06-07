<?php

namespace App\Imports;

use App\Models\Candidate;
use App\Models\ExamSeason;
use App\Services\CredentialGeneratorService;
use App\Services\SubjectAllocationService;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\Hash;

class CandidatesImport implements ToModel, WithHeadingRow
{
    protected ExamSeason $season;
    protected CredentialGeneratorService $credentialGenerator;
    protected SubjectAllocationService $subjectAllocator;

    public function __construct(ExamSeason $season)
    {
        $this->season = $season;
        $this->credentialGenerator = app(CredentialGeneratorService::class);
        $this->subjectAllocator = app(SubjectAllocationService::class);
    }

    public function model(array $row)
    {
        $fileNo = $row['file_no'] ?? null;
        $name = $row['name'] ?? null;
        $telephone = $row['telephone'] ?? null;

        if (!$fileNo || !$name || !$telephone) {
            return null; // Skip invalid rows
        }

        $formattedFileNo = $this->credentialGenerator->formatUsername((string) $fileNo);
        $rawPassword = $this->credentialGenerator->generatePassword($name, $formattedFileNo);

        $candidate = Candidate::updateOrCreate(
            [
                'file_no' => $formattedFileNo,
                'exam_season_id' => $this->season->id,
            ],
            [
                'name' => $name,
                'telephone' => $telephone,
                'email' => $row['email'] ?? null,
                'gender' => $row['gender'] ?? null,
                'department' => $row['department'] ?? null,
                'level' => $row['level'] ?? null,
                'raw_password' => $rawPassword,
                'password' => Hash::make($rawPassword),
                'is_active' => true,
            ]
        );

        // Allocate subjects based on rules
        $this->subjectAllocator->allocateBySubject($candidate);

        return $candidate;
    }
}
