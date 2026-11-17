# Loja Virtual — Trabalho Final P2 (Desenvolvimento Full Stack)

Sistema web simples de e-commerce que permite **cadastrar (POST)**, **listar (GET)** e
**excluir (DELETE)** produtos.

| Parte     | Tecnologia                  | Onde roda                        |
|-----------|-----------------------------|----------------------------------|
| Backend   | PHP 8.2 + Laravel 12        | Máquina virtual com Rocky Linux 9 |
| Banco     | MariaDB 10.5                | A mesma máquina virtual          |
| Frontend  | React 18 + Vite 5           | PC com Windows                   |

```
PC (Windows)                               Máquina virtual (Rocky Linux)
┌──────────────────────────┐   HTTP/JSON   ┌──────────────────────────────┐
│ Navegador                │               │ Laravel  (porta 8000)        │
│ http://localhost:5173    │ ────────────► │ routes/web.php               │
│ React + Vite (proxy)     │               │ ProdutoController            │
└──────────────────────────┘               │ MariaDB  (banco "loja")      │
                                           └──────────────────────────────┘
```

---

## Sumário do tutorial

1. [Preparar a máquina virtual](#1-preparar-a-máquina-virtual)
2. [Instalar PHP, Composer, MariaDB e Git na VM](#2-instalar-php-composer-mariadb-e-git-na-vm)
3. [Baixar o projeto e instalar o backend](#3-baixar-o-projeto-e-instalar-o-backend)
4. [Iniciar o servidor Laravel](#4-iniciar-o-servidor-laravel)
5. [Instalar e rodar o frontend no Windows](#5-instalar-e-rodar-o-frontend-no-windows)
6. [Testar o sistema](#6-testar-o-sistema)
7. [Uso no dia a dia](#7-uso-no-dia-a-dia)
8. [Problemas comuns](#8-problemas-comuns)
9. [Referência do projeto](#9-referência-do-projeto)

---

## 1. Preparar a máquina virtual

Você precisa de uma VM com **Rocky Linux 9** (VirtualBox, VMware ou Hyper-V).

### 1.1 Rede da VM

O PC precisa conseguir acessar a VM pelo IP. No VirtualBox:

1. Com a VM **desligada**, abra **Configurações → Rede → Adaptador 1**.
2. Em **Conectado a**, escolha **Placa em modo Bridge** e selecione a placa de rede do PC.
3. Ligue a VM.

> Se a VM e o PC estiverem em máquinas diferentes (por exemplo, a VM roda em outro computador),
> o modo Bridge é obrigatório e os dois precisam estar na mesma rede.

### 1.2 Descobrir o IP da VM

Dentro da VM:

```bash
hostname -I
```

O primeiro endereço (ex.: `192.168.3.17`) é o IP da VM. **Anote**, ele será usado várias vezes.
Neste tutorial ele aparece como `IP_DA_VM`.

### 1.3 (Opcional) Acessar a VM pelo terminal do Windows

Fica mais fácil copiar e colar os comandos. Na VM, garanta que o SSH está ativo:

```bash
sudo systemctl enable --now sshd
```

No PowerShell do Windows:

```bash
ssh root@IP_DA_VM
```

Digite `yes` na primeira vez e depois a senha do root. Para sair, digite `exit`.

---

## 2. Instalar PHP, Composer, MariaDB e Git na VM

Rode os comandos abaixo **na VM** (como root, ou com `sudo`).

### 2.1 Atualizar o sistema

```bash
sudo dnf update -y
```

### 2.2 PHP 8.2 (pelo repositório Remi)

O Laravel 12 precisa de PHP 8.2 ou mais novo.

```bash
sudo dnf install -y epel-release
```
```bash
sudo dnf install -y https://rpms.remirepo.net/enterprise/remi-release-9.rpm
```
```bash
sudo dnf module reset php -y && sudo dnf module enable php:remi-8.2 -y
```
```bash
sudo dnf install -y php-cli php-common php-mysqlnd php-pdo php-mbstring php-xml php-process php-intl php-zip php-bcmath unzip curl
```

Confira:

```bash
php -v
```

Deve aparecer `PHP 8.2.x`.

### 2.3 Composer

```bash
curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
```
```bash
sudo php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer
```

Confira:

```bash
composer --version
```

### 2.4 MariaDB

```bash
sudo dnf install -y mariadb-server
```
```bash
sudo systemctl enable --now mariadb
```

Confira:

```bash
sudo mysql -e "SELECT VERSION();"
```

### 2.5 Git

```bash
sudo dnf install -y git
```

---

## 3. Baixar o projeto e instalar o backend

### 3.1 Baixar o código

Na VM:

```bash
cd ~ && git clone https://github.com/guilherme-dds/p2-fullsatck.git
```

> Se o repositório for privado, o GitHub pede usuário e um **token de acesso**
> (a senha normal não funciona). Alternativa sem Git: copie a pasta `backend` do PC para a VM
> com `scp -r backend root@IP_DA_VM:~/` (no PowerShell, dentro da pasta do projeto).

### 3.2 Rodar o script de instalação

```bash
cd ~/p2-fullsatck/backend && bash setup-vm.sh
```

Se o usuário `root` do MariaDB tiver senha, rode assim:

```bash
cd ~/p2-fullsatck/backend && DB_ROOT_PASS='senha_do_root' bash setup-vm.sh
```

O script faz tudo sozinho:

| Etapa | O que acontece |
|-------|----------------|
| Verificação | Confere `php`, `composer`, `mysql`, a versão do PHP e as extensões |
| Banco | Cria o banco `loja` e o usuário `loja` (senha `loja123`) |
| Projeto | Cria o projeto Laravel em `~/loja-api` (ex.: `/root/loja-api`) |
| Código | Copia rotas, controller, model, migration e seeders para o projeto |
| `.env` | Configura a conexão com o MariaDB e o IP da VM |
| Tabelas | Roda `php artisan migrate` e `php artisan db:seed` (4 produtos de exemplo) |
| Firewall | Libera a porta 8000 no `firewalld` |

No final ele mostra o IP da VM e o comando para iniciar o servidor.

> **Importante:** o projeto que roda é o de `~/loja-api`. A pasta `~/p2-fullsatck/backend` serve só
> para instalar/atualizar. Se mudar algum arquivo, rode o script de novo (ele reaproveita o projeto).

---

## 4. Iniciar o servidor Laravel

Na VM:

```bash
cd ~/loja-api && nohup php artisan serve --host=0.0.0.0 --port=8000 > serve.log 2>&1 &
```

O servidor fica rodando em segundo plano, mesmo fechando o terminal/SSH.

Teste no **navegador do PC**: `http://IP_DA_VM:8000/produtos`
Deve aparecer a lista de produtos em JSON.

> O `--host=0.0.0.0` é obrigatório: sem ele o Laravel só aceita conexões da própria VM.

### (Opcional) Iniciar o servidor automaticamente quando a VM ligar

Crie o serviço:

```bash
sudo tee /etc/systemd/system/loja-api.service > /dev/null <<'EOF'
[Unit]
Description=Loja Virtual - Laravel
After=network.target mariadb.service

[Service]
WorkingDirectory=/root/loja-api
ExecStart=/usr/bin/php artisan serve --host=0.0.0.0 --port=8000
Restart=always
User=root

[Install]
WantedBy=multi-user.target
EOF
```

Ative (se o servidor já estiver rodando com `nohup`, pare antes com `pkill -f "artisan serve"`):

```bash
sudo systemctl daemon-reload && sudo systemctl enable --now loja-api
```

---

## 5. Instalar e rodar o frontend no Windows

### 5.1 Instalar as ferramentas

1. **Node.js 20 ou mais novo (LTS):** baixe em https://nodejs.org e instale com as opções padrão.
2. **Git:** baixe em https://git-scm.com/download/win e instale com as opções padrão.

Feche e abra o PowerShell, e confira:

```bash
node -v
```
```bash
git --version
```

### 5.2 Baixar o projeto

No PowerShell, na pasta onde quer guardar o projeto (ex.: `Documentos`):

```bash
git clone https://github.com/guilherme-dds/p2-fullsatck.git
```
```bash
cd p2-fullsatck\frontend
```

### 5.3 Apontar o frontend para a VM

Crie o arquivo `.env` a partir do exemplo:

```bash
copy .env.example .env
```

Abra o `.env` no Bloco de Notas e troque o IP pelo da sua VM:

```
VITE_BACKEND_URL=http://IP_DA_VM:8000
```

### 5.4 Instalar as dependências e iniciar

```bash
npm install
```
```bash
npm run dev
```

Abra no navegador: **http://localhost:5173**

> Deixe o PowerShell aberto enquanto usa o sistema. Para parar, pressione `Ctrl + C`.

### Como o frontend fala com a VM (e por que o CSRF funciona)

O Vite repassa (proxy) as chamadas de `/backend/...` para o Laravel na VM. Para o navegador,
tudo está em `localhost:5173`, então o cookie de sessão do Laravel funciona. Antes de cada
POST/DELETE o React chama `GET /csrf-token` e envia o token no cabeçalho `X-CSRF-TOKEN`,
o mesmo papel do `@csrf` em formulários Blade. A proteção CSRF do Laravel fica **ativa**.

---

## 6. Testar o sistema

| Teste | Como fazer | Resultado esperado |
|-------|-----------|--------------------|
| Listar (GET) | Abra a aba **Produtos** | Os 4 produtos de exemplo agrupados por categoria |
| Cadastrar (POST) | Aba **Gerenciar** → preencha o formulário → **Cadastrar produto** | "Produto cadastrado: ..." e o produto aparece na tabela |
| Validação | Cadastre com preço negativo | "O campo preço deve ser no mínimo 0." embaixo do campo |
| Excluir (DELETE) | Clique em **Excluir** e confirme | "Produto ... excluído." e ele some da tabela |
| Banco | Na VM: `sudo mysql loja -e "SELECT * FROM produtos;"` | Os mesmos produtos da tela |

Ver as rotas registradas no Laravel:

```bash
cd ~/loja-api && php artisan route:list --except-vendor
```

---

## 7. Uso no dia a dia

Toda vez que for usar o sistema:

1. Ligue a VM (se o IP mudar, atualize o `frontend\.env`).
2. Na VM, inicie o servidor (pule se configurou o serviço automático):
   ```bash
   cd ~/loja-api && nohup php artisan serve --host=0.0.0.0 --port=8000 > serve.log 2>&1 &
   ```
3. No PC, dentro de `p2-fullsatck\frontend`:
   ```bash
   npm run dev
   ```
4. Abra http://localhost:5173

Atualizar o código na VM depois de mudanças no GitHub:

```bash
cd ~/p2-fullsatck && git pull && cp -r backend/laravel/. ~/loja-api/ && cd ~/loja-api && php artisan optimize:clear
```

---

## 8. Problemas comuns

| Problema | Causa | Solução |
|----------|-------|---------|
| `nome de opção inválido: pipefail` ao rodar o script | Arquivo com quebra de linha do Windows (CRLF) | Na VM: `sed -i 's/\r$//' setup-vm.sh` e rode de novo |
| `ERRO: 'composer' não encontrado` | Composer não instalado ou fora do PATH | Refaça o passo 2.3 |
| `extensões PHP faltando` | Pacote PHP não instalado | `sudo dnf install -y php-mysqlnd php-mbstring php-xml php-pdo php-process` |
| `Access denied for user 'root'` no script | Root do MariaDB tem senha | `DB_ROOT_PASS='senha' bash setup-vm.sh` |
| Navegador do PC não abre `IP_DA_VM:8000` | Servidor parado, firewall ou rede | Confira `pgrep -af "artisan serve"`, `sudo firewall-cmd --list-ports` (deve ter `8000/tcp`) e se a VM está em modo Bridge |
| Frontend mostra "Servidor indisponível" | VM desligada, servidor parado ou IP errado no `.env` | Inicie o servidor (passo 4) e confira o IP no `frontend\.env`; reinicie o `npm run dev` depois de mudar o `.env` |
| Erro 419 ao cadastrar/excluir | Token CSRF expirado ou cookie bloqueado | Recarregue a página; acesse sempre por `http://localhost:5173` (não pelo IP da VM) |
| Erro 500 `View [...] not found` | Código antigo no projeto da VM | Atualize o código (seção 7) e rode `php artisan optimize:clear` |
| Mudou o código e nada mudou | Arquivos copiados para a pasta errada | O projeto que roda é o `~/loja-api`, não o `~/p2-fullsatck/backend` |
| `SQLSTATE[HY000] [2002] Connection refused` | MariaDB parado | `sudo systemctl start mariadb` |

Ver os erros do Laravel:

```bash
tail -n 50 ~/loja-api/storage/logs/laravel.log
```

---

## 9. Referência do projeto

### Estrutura

```
backend/
  setup-vm.sh                                   instala o backend na VM
  laravel/                                      arquivos copiados para o projeto Laravel
    routes/web.php                              rotas (GET, POST, DELETE)
    app/Http/Controllers/ProdutoController.php  lógica de listar, cadastrar e excluir
    app/Models/Produto.php                      model Eloquent
    database/migrations/..._create_produtos_table.php
    database/seeders/ProdutoSeeder.php          produtos de exemplo
frontend/
  src/App.jsx                                   telas (Produtos e Gerenciar)
  src/api.js                                    chamadas HTTP e token CSRF
  vite.config.js                                proxy /backend -> VM
docs/
  Trabalho-Final-P2-Loja-Virtual.pdf            trabalho escrito
```

### Rotas (`routes/web.php`)

| Método | URL               | Ação                         |
|--------|-------------------|------------------------------|
| GET    | `/`               | status da API                |
| GET    | `/csrf-token`     | devolve o token CSRF         |
| GET    | `/produtos`       | lista os produtos            |
| POST   | `/produtos`       | cadastra um produto          |
| DELETE | `/produtos/{id}`  | exclui um produto            |

### Tabela `produtos`

| Coluna      | Tipo            | Nulo |
|-------------|-----------------|------|
| id          | BIGINT (PK)     | não  |
| nome        | VARCHAR(120)    | não  |
| descricao   | TEXT            | sim  |
| categoria   | VARCHAR(60)     | não  |
| preco       | DECIMAL(10,2)   | não  |
| estoque     | INT UNSIGNED    | não  |
| created_at  | TIMESTAMP       | sim  |
| updated_at  | TIMESTAMP       | sim  |

### Dados de acesso ao banco

| Item     | Valor       |
|----------|-------------|
| Banco    | `loja`      |
| Usuário  | `loja`      |
| Senha    | `loja123`   |
| Host     | `127.0.0.1` |

Para mudar, edite as variáveis no início do `backend/setup-vm.sh` antes de rodar.
