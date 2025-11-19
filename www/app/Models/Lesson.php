<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Lesson extends Model
{
    use HasFactory;

    protected $fillable = [
        'module_id',
        'title',
        'description',
        'content',
        'type',
        'order',
        'estimated_minutes',
        'resources',
        'prerequisites',
        'is_active'
    ];

    protected $casts = [
        'resources' => 'array',
        'prerequisites' => 'array',
        'is_active' => 'boolean',
        'estimated_minutes' => 'integer',
        'order' => 'integer'
    ];

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function exercises(): HasMany
    {
        return $this->hasMany(Exercise::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function getProgressForTrainee($traineeId)
    {
        return $this->progress()->where('trainee_id', $traineeId)->first();
    }

    public function isCompletedBy($traineeId): bool
    {
        return $this->progress()
            ->where('trainee_id', $traineeId)
            ->where('is_completed', true)
            ->exists();
    }
}
