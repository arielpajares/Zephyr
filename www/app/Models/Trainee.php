<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Trainee extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'github',
        'motivation',
        'progress',
        'certificate_code',
        'certificate_issued_at'
    ];

    protected $casts = [
        'certificate_issued_at' => 'datetime',
        'progress' => 'integer'
    ];

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class);
    }

    public function lessonProgress(): HasMany
    {
        return $this->hasMany(LessonProgress::class);
    }

    public function moduleProgress(): HasMany
    {
        return $this->hasMany(ModuleProgress::class);
    }

    public function exerciseSubmissions(): HasMany
    {
        return $this->hasMany(ExerciseSubmission::class);
    }

    public function quizAttempts(): HasMany
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function getOverallProgress(): int
    {
        $moduleProgresses = $this->moduleProgress;

        if ($moduleProgresses->isEmpty()) {
            return 0;
        }

        return round($moduleProgresses->avg('completion_percentage'));
    }

    public function updateOverallProgress(): void
    {
        $overallProgress = $this->getOverallProgress();

        $this->update(['progress' => $overallProgress]);

        // Si completa el 100%, generar certificado automáticamente
        if ($overallProgress >= 100 && !$this->certificate_issued_at) {
            $this->generateCertificate();
        }
    }

    public function generateCertificate(): void
    {
        Certificate::create([
            'trainee_id' => $this->id
        ]);

        $this->update([
            'certificate_issued_at' => now()
        ]);
    }
}
