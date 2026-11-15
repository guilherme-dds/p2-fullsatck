# Loja Virtual — Trabalho Final (P2) Desenvolvimento Full Stack

Sistema simples de e-commerce que permite **cadastrar (POST)**, **listar (GET)** e
**excluir (DELETE)** produtos.

| Parte     | Tecnologia                    | Onde roda                 |
|-----------|-------------------------------|---------------------------|
| Backend   | PHP + **Laravel**             | VM (Rocky Linux)          |
| Banco     | **MariaDB**                   | VM (Rocky Linux)          |
| Frontend  | React (Vite) + Blade (extra)  | PC (React) / VM (Blade)   |

## Estrutura

```
backend/
  setup-vm.sh                          -> instala tudo na VM e cria o projeto Laravel
  laravel/                             -> arquivos do projeto (copiados por cima do Laravel novo)
    routes/web.php                     -> ROTAS (GET, POST, DELETE)
    app/Http/Controllers/ProdutoController.php
    app/Models/Produto.php
    database/migrations/..._create_produtos_table.php
    database/seeders/ProdutoSeeder.php -> produtos de exemplo
    resources/views/produtos/index.blade.php  -> formulários com @csrf
frontend/                              -> React (vitrine + tela de gerenciamento)
```

## Rotas (`routes/web.php`)

| Método | URL                 | Ação                          |
|--------|---------------------|-------------------------------|
| GET    | `/`                 | redireciona para `/produtos`  |
| GET    | `/csrf-token`       | devolve o token CSRF (React)  |
| GET    | `/produtos`         | lista produtos                |
| POST   | `/produtos`         | cadastra produto              |
| DELETE | `/produtos/{id}`    | exclui produto                |

As mesmas rotas servem o Blade (HTML) e o React (JSON — quando a requisição envia
`Accept: application/json`, o controller responde em JSON).

## Tabela `produtos`

| Coluna      | Tipo            |
|-------------|-----------------|
| id          | BIGINT (PK)     |
| nome        | VARCHAR(120)    |
| descricao   | TEXT (nulo)     |
| categoria   | VARCHAR(60)     |
| preco       | DECIMAL(10,2)   |
| estoque     | INT UNSIGNED    |
| created_at  | TIMESTAMP       |
| updated_at  | TIMESTAMP       |

---

## 1. Backend na VM (Rocky Linux)

Pré-requisitos já instalados na VM: **PHP 8.1+** (com `php-mysqlnd`, `php-mbstring`,
`php-xml`), **Composer** e **MariaDB**.

**Rede da VM:** use *Placa em modo Bridge* (ou *Host-only*) para o PC conseguir
acessar o IP da VM. Se usar NAT, crie um redirecionamento da porta 8000.

1. Copie a pasta `backend` para a VM (pasta compartilhada, `git clone` ou `scp`):
   ```bash
   scp -r backend usuario@IP_DA_VM:~/
   ```
2. Na VM:
   ```bash
   cd ~/backend
   bash setup-vm.sh
   ```
   Se o usuário root do MariaDB tiver senha, rode assim:
   `DB_ROOT_PASS='senha' bash setup-vm.sh`

   O script verifica PHP e as extensões necessárias, cria o banco `loja`
   (usuário `loja` / senha `loja123`), cria o projeto Laravel em `~/loja-api`
   (Laravel 12 com PHP 8.2+, ou Laravel 10 com PHP 8.1), configura o `.env`, roda as
   migrations, insere produtos de exemplo e libera a porta 8000 no `firewalld`.
   No final ele mostra o IP da VM.
3. Inicie o servidor (sempre que ligar a VM):
   ```bash
   cd ~/loja-api
   php artisan serve --host=0.0.0.0 --port=8000
   ```
4. Teste no navegador do PC: `http://IP_DA_VM:8000/produtos` (tela em Blade).

Se não abrir no PC, confira o firewall: `sudo firewall-cmd --list-ports` (deve aparecer `8000/tcp`).

## 2. Frontend no PC

```bash
cd frontend
copy .env.example .env      # no Linux/Mac: cp .env.example .env
```

Edite o `.env` e coloque o IP da VM:

```
VITE_BACKEND_URL=http://192.168.0.50:8000
```

Depois:

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`.

### Como o CSRF funciona no React

O Vite repassa (proxy) as chamadas de `/backend/...` para o Laravel na VM, então
para o navegador tudo está em `localhost:5173` e o cookie de sessão funciona.
Antes de um POST/DELETE, o React chama `GET /csrf-token` e envia o token no campo
`_token` e no cabeçalho `X-CSRF-TOKEN` — o mesmo que o `@csrf` faz no Blade.
O middleware de CSRF do Laravel continua **ativo** em todas as rotas.

## Ver o banco de dados na VM

```bash
sudo mysql loja -e "DESCRIBE produtos; SELECT * FROM produtos;"
```
