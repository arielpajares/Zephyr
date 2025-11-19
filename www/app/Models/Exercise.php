<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Exercise extends Model
{
    use HasFactory;

    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'instructions',
        'starter_code',
        'solution_code',
        'test_cases',
        'points',
        'difficulty'
    ];

    protected $casts = [
        'test_cases' => 'array',
        'points' => 'integer'
    ];

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(ExerciseSubmission::class);
    }

    public function getLatestSubmissionForTrainee($traineeId)
    {
        return $this->submissions()
            ->where('trainee_id', $traineeId)
            ->latest()
            ->first();
    }

    public function isCompletedBy($traineeId): bool
    {
        return $this->submissions()
            ->where('trainee_id', $traineeId)
            ->where('is_correct', true)
            ->exists();
    }
}
