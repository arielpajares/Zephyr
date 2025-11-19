<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LessonProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainee_id',
        'lesson_id',
        'is_completed',
        'time_spent_minutes',
        'started_at',
        'completed_at',
        'notes'
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'time_spent_minutes' => 'integer',
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'notes' => 'array'
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function markCompleted(): void
    {
        $this->update([
            'is_completed' => true,
            'completed_at' => now()
        ]);
    }

    public function addTimeSpent(int $minutes): void
    {
        $this->increment('time_spent_minutes', $minutes);
    }
}
