<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
class Certificate extends Model
{
    use HasFactory;
    protected $fillable = ['trainee_id','code','issued_at'];
    public $timestamps = true;
    protected static function boot()
    {
        parent::boot();
        static::creating(function ($certificate) {
            if (empty($certificate->code)) {
                $certificate->code = strtoupper(Str::random(10));
            }
            if (empty($certificate->issued_at)) {
                $certificate->issued_at = now();
            }
        });
    }
    public function trainee() { return $this->belongsTo(Trainee::class); }
}
