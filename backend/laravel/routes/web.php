<?php

use App\Http\Controllers\ProdutoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas da Loja (e-commerce)
|--------------------------------------------------------------------------
| O frontend é feito em React e consome estas rotas em JSON.
| A proteção CSRF do grupo "web" continua ativa: o React busca o token em
| /csrf-token e o envia no cabeçalho X-CSRF-TOKEN em todo POST e DELETE.
*/

// Status da API
Route::get('/', function () {
    return response()->json(['api' => 'Loja Virtual', 'status' => 'online']);
});

// Entrega o token CSRF para o frontend React
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf');

// LISTAR (GET)
Route::get('/produtos', [ProdutoController::class, 'index'])->name('produtos.index');

// CADASTRAR (POST)
Route::post('/produtos', [ProdutoController::class, 'store'])->name('produtos.store');

// EXCLUIR (DELETE)
Route::delete('/produtos/{produto}', [ProdutoController::class, 'destroy'])->name('produtos.destroy');
