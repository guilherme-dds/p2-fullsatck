<?php

namespace App\Http\Controllers;

use App\Models\Produto;
use Illuminate\Http\Request;

class ProdutoController extends Controller
{
    /**
     * GET /produtos — lista os produtos.
     * Retorna JSON para o React ou a view Blade para o navegador.
     */
    public function index(Request $request)
    {
        $produtos = Produto::orderByDesc('id')->get();

        if ($request->wantsJson()) {
            return response()->json($produtos);
        }

        return view('produtos.index', compact('produtos'));
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

        if ($request->wantsJson()) {
            return response()->json($produto, 201);
        }

        return redirect()
            ->route('produtos.index')
            ->with('sucesso', "Produto \"{$produto->nome}\" cadastrado com sucesso!");
    }

    /**
     * DELETE /produtos/{produto} — exclui um produto.
     */
    public function destroy(Request $request, Produto $produto)
    {
        $nome = $produto->nome;
        $produto->delete();

        if ($request->wantsJson()) {
            return response()->json(['mensagem' => "Produto \"{$nome}\" excluído."]);
        }

        return redirect()
            ->route('produtos.index')
            ->with('sucesso', "Produto \"{$nome}\" excluído.");
    }
}
