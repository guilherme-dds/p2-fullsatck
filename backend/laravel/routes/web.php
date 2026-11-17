<?php

use App\Http\Controllers\ProdutoController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json(['api' => 'Loja Virtual', 'status' => 'online']);
});

Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf');

Route::get('/produtos', [ProdutoController::class, 'index'])->name('produtos.index');

Route::post('/produtos', [ProdutoController::class, 'store'])->name('produtos.store');

Route::delete('/produtos/{produto}', [ProdutoController::class, 'destroy'])->name('produtos.destroy');
