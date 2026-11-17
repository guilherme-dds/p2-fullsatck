#!/usr/bin/env bash
set -euo pipefail

DB_NAME="loja"
DB_USER="loja"
DB_PASS="loja123"
APP_DIR="$HOME/loja-api"
PORTA=8000
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
export COMPOSER_ALLOW_SUPERUSER=1

for cmd in php composer mysql; do
    command -v "$cmd" >/dev/null 2>&1 || { echo "ERRO: '$cmd' não encontrado."; exit 1; }
done

PHP_VER="$(php -r 'echo PHP_MAJOR_VERSION.".".PHP_MINOR_VERSION;')"
if php -r 'exit(PHP_VERSION_ID >= 80200 ? 0 : 1);'; then
    LARAVEL_VER="^12.0"
elif php -r 'exit(PHP_VERSION_ID >= 80100 ? 0 : 1);'; then
    LARAVEL_VER="^10.0"
else
    echo "ERRO: PHP $PHP_VER é antigo. O Laravel precisa de PHP 8.1 ou superior."
    exit 1
fi
echo "==> PHP $PHP_VER encontrado -> Laravel $LARAVEL_VER"

FALTANDO=""
MODULOS="$(php -m)"
for ext in pdo_mysql mbstring xml ctype tokenizer fileinfo openssl dom; do
    grep -qix "$ext" <<< "$MODULOS" || FALTANDO="$FALTANDO $ext"
done
if [ -n "$FALTANDO" ]; then
    echo "ATENÇÃO: extensões PHP faltando:$FALTANDO"
    echo "Instale com: sudo dnf install php-mysqlnd php-mbstring php-xml php-pdo php-process"
    exit 1
fi

echo "==> Garantindo que o MariaDB está rodando..."
sudo systemctl enable --now mariadb

echo "==> Criando banco '$DB_NAME' e usuário '$DB_USER'..."
if [ -n "${DB_ROOT_PASS:-}" ]; then
    MYSQL_ROOT=(mysql -u root "-p$DB_ROOT_PASS")
else
    MYSQL_ROOT=(sudo mysql -u root)
fi
"${MYSQL_ROOT[@]}" <<SQL
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';
CREATE USER IF NOT EXISTS '$DB_USER'@'127.0.0.1' IDENTIFIED BY '$DB_PASS';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'127.0.0.1';
FLUSH PRIVILEGES;
SQL

if [ ! -f "$APP_DIR/artisan" ]; then
    echo "==> Criando projeto Laravel em $APP_DIR..."
    composer create-project "laravel/laravel:$LARAVEL_VER" "$APP_DIR" --no-scripts
    cd "$APP_DIR"
    [ -f .env ] || cp .env.example .env
    php artisan key:generate
else
    echo "==> Projeto já existe em $APP_DIR (reaproveitando)."
fi

echo "==> Copiando arquivos da loja (rotas, controller, model, migration, seeders)..."
cp -r "$SCRIPT_DIR/laravel/." "$APP_DIR/"
cd "$APP_DIR"

set_env() {
    sed -i "/^#\? \?$1=/d" .env
    echo "$1=$2" >> .env
}

VM_IP="$(hostname -I | awk '{print $1}')"

set_env APP_URL        "http://$VM_IP:$PORTA"
set_env APP_LOCALE     "pt_BR"
set_env DB_CONNECTION  "mysql"
set_env DB_HOST        "127.0.0.1"
set_env DB_PORT        "3306"
set_env DB_DATABASE    "$DB_NAME"
set_env DB_USERNAME    "$DB_USER"
set_env DB_PASSWORD    "$DB_PASS"
set_env SESSION_DRIVER "file"
set_env CACHE_STORE    "file"
set_env CACHE_DRIVER   "file"

chmod -R ug+rw storage bootstrap/cache

echo "==> Criando tabelas e inserindo produtos de exemplo..."
php artisan config:clear
php artisan migrate --force
php artisan db:seed --force

if systemctl is-active --quiet firewalld; then
    echo "==> Liberando a porta $PORTA no firewall..."
    sudo firewall-cmd --permanent --add-port="$PORTA/tcp" >/dev/null
    sudo firewall-cmd --reload >/dev/null
fi

echo
echo "============================================================"
echo " Backend pronto!"
echo " Para iniciar o servidor:"
echo "   cd $APP_DIR && php artisan serve --host=0.0.0.0 --port=$PORTA"
echo
echo " Teste no PC:    http://$VM_IP:$PORTA/produtos   (deve mostrar o JSON)"
echo " No frontend React (.env):  VITE_BACKEND_URL=http://$VM_IP:$PORTA"
echo "============================================================"
