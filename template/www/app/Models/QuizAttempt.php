<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainee_id',
        'quiz_id',
        'score',
        'max_score',
        'passed',
        'answers',
        'time_taken_minutes',
        'started_at',
        'completed_at'
    ];

    protected $casts = [
        'score' => 'integer',
        'max_score' => 'integer',
        'passed' => 'boolean',
        'answers' => 'array',
        'time_taken_minutes' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    public function quiz(): BelongsTo
    {
        return $this->belongsTo(Quiz::class);
    }

    public function getPercentage(): float
    {
        if ($this->max_score == 0) return 0;
        return ($this->score / $this->max_score) * 100;
    }
}
