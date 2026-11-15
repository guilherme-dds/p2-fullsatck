<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Loja Virtual — Produtos</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; background: #f4f5f7; color: #222; }
        header { background: #1f3a5f; color: #fff; padding: 16px 24px; }
        main { max-width: 960px; margin: 24px auto; padding: 0 16px; }
        .card { background: #fff; border: 1px solid #ddd; border-radius: 6px; padding: 16px; margin-bottom: 24px; }
        label { display: block; font-size: 14px; margin: 10px 0 4px; }
        input, select, textarea { width: 100%; padding: 8px; border: 1px solid #bbb; border-radius: 4px; box-sizing: border-box; }
        .linha { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        button { padding: 8px 16px; border: 0; border-radius: 4px; cursor: pointer; }
        .salvar { background: #1f3a5f; color: #fff; margin-top: 12px; }
        .excluir { background: #c0392b; color: #fff; }
        table { width: 100%; border-collapse: collapse; }
        th, td { text-align: left; padding: 8px; border-bottom: 1px solid #eee; }
        .ok { background: #e3f6e8; border: 1px solid #9bd3a8; padding: 10px; border-radius: 4px; margin-bottom: 16px; }
        .erro { background: #fdecea; border: 1px solid #f5b5ae; padding: 10px; border-radius: 4px; margin-bottom: 16px; }
    </style>
</head>
<body>
<header>
    <h1 style="margin:0">Loja Virtual — Gerenciar Produtos</h1>
</header>

<main>
    @if (session('sucesso'))
        <div class="ok">{{ session('sucesso') }}</div>
    @endif

    @if ($errors->any())
        <div class="erro">
            <ul style="margin:0">
                @foreach ($errors->all() as $erro)
                    <li>{{ $erro }}</li>
                @endforeach
            </ul>
        </div>
    @endif

    {{-- CADASTRAR (POST) --}}
    <div class="card">
        <h2 style="margin-top:0">Cadastrar produto</h2>
        <form method="POST" action="{{ route('produtos.store') }}">
            @csrf

            <label for="nome">Nome</label>
            <input id="nome" name="nome" value="{{ old('nome') }}" required>

            <label for="descricao">Descrição</label>
            <textarea id="descricao" name="descricao" rows="2">{{ old('descricao') }}</textarea>

            <div class="linha">
                <div>
                    <label for="categoria">Categoria</label>
                    <select id="categoria" name="categoria" required>
                        @foreach (['Eletrônicos', 'Roupas', 'Casa', 'Livros', 'Outros'] as $cat)
                            <option value="{{ $cat }}" @selected(old('categoria') === $cat)>{{ $cat }}</option>
                        @endforeach
                    </select>
                </div>
                <div>
                    <label for="preco">Preço (R$)</label>
                    <input id="preco" name="preco" type="number" step="0.01" min="0" value="{{ old('preco') }}" required>
                </div>
                <div>
                    <label for="estoque">Estoque</label>
                    <input id="estoque" name="estoque" type="number" min="0" value="{{ old('estoque', 0) }}" required>
                </div>
            </div>

            <button type="submit" class="salvar">Cadastrar</button>
        </form>
    </div>

    {{-- LISTAR (GET) --}}
    <div class="card">
        <h2 style="margin-top:0">Produtos cadastrados ({{ $produtos->count() }})</h2>

        @if ($produtos->isEmpty())
            <p>Nenhum produto cadastrado.</p>
        @else
            <table>
                <thead>
                <tr>
                    <th>ID</th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th></th>
                </tr>
                </thead>
                <tbody>
                @foreach ($produtos as $produto)
                    <tr>
                        <td>{{ $produto->id }}</td>
                        <td>{{ $produto->nome }}</td>
                        <td>{{ $produto->categoria }}</td>
                        <td>R$ {{ number_format($produto->preco, 2, ',', '.') }}</td>
                        <td>{{ $produto->estoque }}</td>
                        <td>
                            {{-- EXCLUIR (DELETE) --}}
                            <form method="POST" action="{{ route('produtos.destroy', $produto) }}"
                                  onsubmit="return confirm(@js('Excluir ' . $produto->nome . '?'))">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="excluir">Excluir</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
                </tbody>
            </table>
        @endif
    </div>
</main>
</body>
</html>
