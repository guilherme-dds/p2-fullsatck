<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    /**
     * GET /produtos — lista os produtos (JSON para o frontend React).
     */
    public function index()
    {
        $produtos = Produto::orderByDesc('id')->get();

        return response()->json($produtos);
    }

    /**
     * POST /produtos — cadastra um novo produto.
     */
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

    /**
     * DELETE /produtos/{produto} — exclui um produto.
     */
    public function destroy(Produto $produto)
    {
        $nome = $produto->nome;
        $produto->delete();

        return response()->json(['mensagem' => "Produto \"{$nome}\" excluído."]);
    }
}
