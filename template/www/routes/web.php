<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TraineeController;
use App\Http\Controllers\CertificateController;

Route::get('/', [TraineeController::class,'index'])->name('home');
Route::post('/register', [TraineeController::class,'store'])->name('trainees.store');
Route::post('/login', function(){ return redirect('/'); })->name('login.post');
Route::get('/magic-login/{id}/{token}', function($id,$token){ $sessionToken = session('magic_token_'.$id) ?? null; if($sessionToken && $sessionToken === $token){ session(['trainee_id'=>$id]); return redirect('/panel'); } return redirect('/')->with('error','Token inválido'); });
Route::get('/panel', function(){ $id = session('trainee_id') ?? null; if(!$id) return redirect('/'); $t = App\Models\Trainee::findOrFail($id); return view('panel.dashboard', ['trainee'=>$t]); })->name('trainee.panel');
Route::get('/certificate/download/{id}', [CertificateController::class,'generate'])->name('certificate.download');
Route::get('/verify/{code}', [CertificateController::class,'verify'])->name('certificate.verify');
Route::post('/connect/github', function(\Illuminate\Http\Request $r){ $repo = $r->input('repo'); $id = $r->input('trainee_id'); if($repo && $id){ $t = App\Models\Trainee::find($id); if($t){ $t->progress = 100; $t->save(); return response()->json(['status'=>'ok']); } } return response()->json(['status'=>'failed']); });
