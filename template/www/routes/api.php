<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ModuleController;
use App\Http\Controllers\Api\LessonController;
use App\Http\Controllers\Api\ExerciseController;
use App\Http\Controllers\Api\QuizController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Bootcamp API Routes
Route::prefix('bootcamp')->group(function () {
    // Módulos
    Route::get('/modules', [ModuleController::class, 'index']);
    Route::get('/modules/{module}', [ModuleController::class, 'show']);
    Route::get('/modules/{module}/progress', [ModuleController::class, 'progress']);

    // Lecciones
    Route::get('/lessons/{lesson}', [LessonController::class, 'show']);
    Route::post('/lessons/{lesson}/start', [LessonController::class, 'start']);
    Route::post('/lessons/{lesson}/complete', [LessonController::class, 'complete']);
    Route::get('/lessons/{lesson}/progress', [LessonController::class, 'progress']);

    // Ejercicios
    Route::get('/exercises/{exercise}', [ExerciseController::class, 'show']);
    Route::post('/exercises/{exercise}/submit', [ExerciseController::class, 'submit']);
    Route::get('/exercises/{exercise}/submissions', [ExerciseController::class, 'submissions']);

    // Quizzes
    Route::get('/quizzes/{quiz}', [QuizController::class, 'show']);
    Route::post('/quizzes/{quiz}/start', [QuizController::class, 'start']);
    Route::post('/quizzes/{quiz}/submit', [QuizController::class, 'submit']);
    Route::get('/quizzes/{quiz}/attempts', [QuizController::class, 'attempts']);
});

// Dashboard y progreso general del trainee
Route::get('/trainees/{trainee}/dashboard', function ($traineeId) {
    $trainee = \App\Models\Trainee::with([
        'moduleProgress.module',
        'lessonProgress',
        'exerciseSubmissions',
        'quizAttempts'
    ])->findOrFail($traineeId);

    $stats = [
        'overall_progress' => $trainee->getOverallProgress(),
        'modules_completed' => $trainee->moduleProgress()->where('completion_percentage', 100)->count(),
        'total_modules' => \App\Models\Module::where('is_active', true)->count(),
        'lessons_completed' => $trainee->lessonProgress()->where('is_completed', true)->count(),
        'exercises_completed' => $trainee->exerciseSubmissions()->where('is_correct', true)->distinct('exercise_id')->count(),
        'quizzes_passed' => $trainee->quizAttempts()->where('passed', true)->distinct('quiz_id')->count(),
        'total_time_spent' => $trainee->lessonProgress()->sum('time_spent_minutes'),
        'certificate_issued' => $trainee->certificate_issued_at !== null
    ];

    return response()->json([
        'trainee' => $trainee,
        'stats' => $stats
    ]);
});
