<?php

namespace Database\Seeders;

use App\Models\Produto;
use Illuminate\Database\Seeder;

class ProdutoSeeder extends Seeder
{
    public function run(): void
    {
        $produtos = [
            ['nome' => 'Fone de Ouvido Bluetooth', 'categoria' => 'Eletrônicos', 'preco' => 199.90, 'estoque' => 25,
             'descricao' => 'Fone sem fio com cancelamento de ruído e 20h de bateria.'],
            ['nome' => 'Camiseta Básica Algodão', 'categoria' => 'Roupas', 'preco' => 49.90, 'estoque' => 100,
             'descricao' => 'Camiseta 100% algodão, disponível em várias cores.'],
            ['nome' => 'Garrafa Térmica 1L', 'categoria' => 'Casa', 'preco' => 89.00, 'estoque' => 40,
             'descricao' => 'Mantém a bebida quente ou gelada por até 12 horas.'],
            ['nome' => 'Livro: Lógica de Programação', 'categoria' => 'Livros', 'preco' => 74.50, 'estoque' => 15,
             'descricao' => 'Introdução a algoritmos e estruturas de dados.'],
        ];

        foreach ($produtos as $p) {
            Produto::firstOrCreate(['nome' => $p['nome']], $p);
        }
    }
}
