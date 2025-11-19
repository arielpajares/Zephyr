<?php
namespace App\Mail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
class MagicLinkMail extends Mailable {
    use Queueable, SerializesModels;
    public $trainee; public $token;
    public function __construct($trainee,$token){ $this->trainee=$trainee; $this->token=$token; }
    public function build(){ $link = url('/magic-login/'.$this->trainee->id.'/'.$this->token); return $this->subject('Acceso BITNET Trainee')->view('emails.magic')->with(['link'=>$link,'trainee'=>$this->trainee]); }
}
