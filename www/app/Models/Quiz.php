<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'description',
        'passing_score',
        'time_limit_minutes',
        'randomize_questions'
    ];

    protected $casts = [
        'passing_score' => 'integer',
        'time_limit_minutes' => 'integer',
        'randomize_questions' => 'boolean'
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(QuizQuestion::class);
    }

    public function attempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function getQuestionsForAttempt()
    {
        $questions = $this->questions;

        if ($this->randomize_questions) {
            return $questions->shuffle();
        }

        return $questions;
    }

    public function getBestAttemptForTrainee($traineeId)
    {
        return $this->attempts()
            ->where('trainee_id', $traineeId)
            ->orderBy('score', 'desc')
            ->first();
    }

    public function isPassedBy($traineeId): bool
    {
        return $this->attempts()
            ->where('trainee_id', $traineeId)
            ->where('passed', true)
            ->exists();
    }
}
