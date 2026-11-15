<?php

use App\Http\Controllers\ProdutoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Rotas da Loja (e-commerce)
|--------------------------------------------------------------------------
| As mesmas rotas atendem:
|  - o frontend em Blade (formulários HTML com @csrf), e
|  - o frontend em React (requisições com "Accept: application/json").
*/

// Página inicial -> lista de produtos
Route::get('/', function () {
    return redirect()->route('produtos.index');
});

// Entrega o token CSRF para o frontend React (equivalente ao @csrf do Blade)
Route::get('/csrf-token', function () {
    return response()->json(['token' => csrf_token()]);
})->name('csrf');

// LISTAR (GET)
Route::get('/produtos', [ProdutoController::class, 'index'])->name('produtos.index');

// CADASTRAR (POST)
Route::post('/produtos', [ProdutoController::class, 'store'])->name('produtos.store');

// EXCLUIR (DELETE)
Route::delete('/produtos/{produto}', [ProdutoController::class, 'destroy'])->name('produtos.destroy');
