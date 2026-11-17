<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    public function index()
    {
        $produtos = Produto::orderByDesc('id')->get();

        return response()->json($produtos);
    }

    public function store(Request $request)
    {
        $dados = $request->validate(
            [
                'nome'      => 'required|string|max:120',
                'descricao' => 'nullable|string|max:1000',
                'categoria' => 'required|string|max:60',
                'preco'     => 'required|numeric|min:0',
                'estoque'   => 'required|integer|min:0',
            ],
            [
                'required' => 'O campo :attribute é obrigatório.',
                'numeric'  => 'O campo :attribute deve ser um número.',
                'integer'  => 'O campo :attribute deve ser um número inteiro.',
                'min'      => 'O campo :attribute deve ser no mínimo :min.',
                'max'      => 'O campo :attribute deve ter no máximo :max caracteres.',
            ],
            [
                'nome'      => 'nome',
                'descricao' => 'descrição',
                'categoria' => 'categoria',
                'preco'     => 'preço',
                'estoque'   => 'estoque',
            ]
        );

        $produto = Produto::create($dados);

        return response()->json($produto, 201);
    }

    public function destroy(Produto $produto)
    {
        $nome = $produto->nome;
        $produto->delete();

        return response()->json(['mensagem' => "Produto \"{$nome}\" excluído."]);
    }
}
