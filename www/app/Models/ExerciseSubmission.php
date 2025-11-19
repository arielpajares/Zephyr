<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExerciseSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainee_id',
        'exercise_id',
        'submitted_code',
        'is_correct',
        'score',
        'test_results',
        'feedback'
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'score' => 'integer',
        'test_results' => 'array'
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    public function exercise(): BelongsTo
    {
        return $this->belongsTo(Exercise::class);
    }
}
