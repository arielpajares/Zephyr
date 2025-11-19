<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ModuleProgress extends Model
{
    use HasFactory;

    protected $fillable = [
        'trainee_id',
        'module_id',
        'completion_percentage',
        'lessons_completed',
        'exercises_completed',
        'quiz_passed',
        'started_at',
        'completed_at'
    ];

    protected $casts = [
        'completion_percentage' => 'integer',
        'lessons_completed' => 'integer',
        'exercises_completed' => 'integer',
        'quiz_passed' => 'boolean',
        'started_at' => 'datetime',
        'completed_at' => 'datetime'
    ];

    public function trainee(): BelongsTo
    {
        return $this->belongsTo(Trainee::class);
    }

    public function module(): BelongsTo
    {
        return $this->belongsTo(Module::class);
    }

    public function updateProgress(): void
    {
        $module = $this->module;
        $traineeId = $this->trainee_id;

        // Calcular lecciones completadas
        $totalLessons = $module->getTotalLessons();
        $completedLessons = LessonProgress::where('trainee_id', $traineeId)
            ->whereIn('lesson_id', $module->lessons->pluck('id'))
            ->where('is_completed', true)
            ->count();

        // Calcular ejercicios completados
        $totalExercises = $module->getTotalExercises();
        $completedExercises = 0;

        foreach ($module->lessons as $lesson) {
            foreach ($lesson->exercises as $exercise) {
                if ($exercise->isCompletedBy($traineeId)) {
                    $completedExercises++;
                }
            }
        }

        // Verificar quiz
        $quiz = $module->quizzes()->first();
        $quizPassed = $quiz ? $quiz->isPassedBy($traineeId) : true;

        // Calcular porcentaje total
        $lessonWeight = 40;
        $exerciseWeight = 40;
        $quizWeight = 20;

        $lessonProgress = $totalLessons > 0 ? ($completedLessons / $totalLessons) * $lessonWeight : 0;
        $exerciseProgress = $totalExercises > 0 ? ($completedExercises / $totalExercises) * $exerciseWeight : 0;
        $quizProgress = $quizPassed ? $quizWeight : 0;

        $totalProgress = round($lessonProgress + $exerciseProgress + $quizProgress);

        $this->update([
            'lessons_completed' => $completedLessons,
            'exercises_completed' => $completedExercises,
            'quiz_passed' => $quizPassed,
            'completion_percentage' => $totalProgress,
            'completed_at' => $totalProgress >= 100 ? now() : null
        ]);
    }
}
