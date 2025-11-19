<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Module extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'order',
        'difficulty',
        'estimated_hours',
        'learning_objectives',
        'is_active'
    ];

    protected $casts = [
        'learning_objectives' => 'array',
        'is_active' => 'boolean',
        'estimated_hours' => 'integer',
        'order' => 'integer'
    ];

    public function lessons(): HasMany
    {
        return $this->hasMany(Lesson::class)->orderBy('order');
    }

    public function quizzes(): HasMany
    {
        return $this->hasMany(Quiz::class);
    }

    public function progress(): HasMany
    {
        return $this->hasMany(ModuleProgress::class);
    }

    public function getProgressForTrainee($traineeId)
    {
        return $this->progress()->where('trainee_id', $traineeId)->first();
    }

    public function getTotalLessons(): int
    {
        return $this->lessons()->count();
    }

    public function getTotalExercises(): int
    {
        return $this->lessons()->withCount('exercises')->get()->sum('exercises_count');
    }
}
