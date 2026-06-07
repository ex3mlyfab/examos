<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\ExamSeason;
use App\Models\Subject;

class SubjectAllocationService
{
    /**
     * Allocate subjects to a candidate based on criteria.
     * allocation_criteria is JSON like {"department": "CS", "level": "300"}
     * If criteria is empty, subject is for all.
     */
    public function allocateBySubject(Candidate $candidate): void
    {
        $season = $candidate->examSeason;
        
        if (!$season) return;

        $subjects = $season->subjects()->where('is_active', true)->get();

        $allocatedIds = [];

        if ($season->isCombinedMode()) {
            foreach ($subjects as $subject) {
                $criteria = $subject->allocation_criteria;
                
                if (empty($criteria)) continue;

                if (isset($criteria['is_base_combo_subject']) && $criteria['is_base_combo_subject'] === true) {
                    $allocatedIds[] = $subject->id;
                    continue;
                }

                if (isset($criteria['department_specific']) && $criteria['department_specific'] === true) {
                    $departments = $criteria['departments'] ?? [];
                    // Handle single string or array of departments
                    if (is_array($departments)) {
                        if (in_array($candidate->department, $departments)) {
                            $allocatedIds[] = $subject->id;
                        }
                    } else if ($candidate->department === $departments) {
                        $allocatedIds[] = $subject->id;
                    }
                }
            }
        } else {
            foreach ($subjects as $subject) {
                $criteria = $subject->allocation_criteria;
                
                if (empty($criteria)) {
                    $allocatedIds[] = $subject->id;
                    continue;
                }

                $matches = true;
                foreach ($criteria as $key => $value) {
                    if ($candidate->$key !== $value) {
                        $matches = false;
                        break;
                    }
                }

                if ($matches) {
                    $allocatedIds[] = $subject->id;
                }
            }
        }

        $candidate->subjects()->sync($allocatedIds);
    }
}
