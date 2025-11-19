<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use App\Models\Trainee;
use App\Models\Certificate;
class DemoSeeder extends Seeder {
    public function run(){
        $t = Trainee::create(['name'=>'Demo User','email'=>'demo@bitnet.local','github'=>'https://github.com/demo','motivation'=>'Demo','progress'=>100]);
        $c = Certificate::create(['trainee_id'=>$t->id]);
    }
}
