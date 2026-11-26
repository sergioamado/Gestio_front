# Implantação em produção (Ubuntu Server)

Guia passo a passo para colocar o COSUP+ no ar num servidor Ubuntu, no endereço **cosupmais**.

Nos exemplos o endereço é `cosupmais.ufs.br`. Se o nome final for outro, troque em todos os lugares onde ele aparece. Os comandos foram pensados para **Ubuntu Server 24.04 LTS** (também servem no 22.04).

## Visão geral

Tudo fica num único servidor e num único endereço:

```mermaid
flowchart LR
    U["Navegador<br/>https://cosupmais.ufs.br"] -->|443 HTTPS| N[Nginx]
    N -->|/ arquivos do site| F["/var/www/cosupmais<br/>front compilado"]
    N -->|/api, /socket.io, /uploads| B["Back Node.js<br/>127.0.0.1:3001<br/>serviço systemd"]
    B --> P[("PostgreSQL<br/>127.0.0.1:5432")]
    B --> D["uploads/<br/>fotos do patrimônio"]
    B <-->|polling| T[Telegram]
```

- O **Nginx** é a única porta aberta para a rede (80 e 443).
  - Ele entrega o front já compilado (arquivos estáticos).
  - Ele repassa `/api`, `/socket.io` (tempo real e notificações) e `/uploads` para o back.
- O **back** (Express) roda como serviço do sistema e só escuta em `127.0.0.1:3001`.
- O **PostgreSQL** só aceita conexões da própria máquina.

## Resumo rápido

| Etapa | O que fazer |
|---|---|
| 0 | Pedir o DNS `cosupmais.ufs.br` à STI, apontando para o IP do servidor |
| 1 | Atualizar o Ubuntu, criar o usuário `cosup` e ligar o firewall |
| 2 | Instalar Node.js 24, PostgreSQL, Nginx e Git |
| 3 | Criar o banco e o usuário do banco |
| 4 | Baixar o código dos dois repositórios |
| 5 | Configurar e compilar o back, aplicar as migrações e criar o admin |
| 6 | Criar o serviço `cosupmais-back` no systemd |
| 7 | Configurar e compilar o front |
| 8 | Configurar o Nginx para `cosupmais.ufs.br` |
| 9 | Ativar o HTTPS |
| 10 | Testar tudo |
| 11 | Configurar o backup automático |

---

## 0. Antes de começar

Você vai precisar de:

- Um servidor Ubuntu com acesso `sudo`, de preferência com pelo menos 2 GB de RAM e 20 GB de disco.
- Um **IP fixo** para o servidor, por exemplo `10.110.1.50` (rede interna) ou um IP público.
- O **nome `cosupmais.ufs.br` cadastrado no DNS**. Isso é feito pela STI/UFS, que cuida do domínio `ufs.br`. Peça um **registro A**:

  ```text
  cosupmais.ufs.br.   A   <IP do servidor>
  ```

  Enquanto o DNS não sai, dá para testar numa máquina só, editando o arquivo de hosts dela:
  - Linux: `/etc/hosts`
  - Windows: `C:\Windows\System32\drivers\etc\hosts`

  ```text
  10.110.1.50   cosupmais.ufs.br
  ```

- O token do bot do Telegram (o mesmo do `.env` atual ou um bot novo, criado no @BotFather).

> **Antes de implantar o back:** o trabalho atual está na branch `correcoes-seguranca-regras-os`. Faça o merge em `main` e o push dos dois repositórios, porque o servidor vai baixar de `main` (back) e de `master` (front).

---

## 1. Preparar o servidor

Entre no servidor por SSH e atualize o sistema:

```bash
sudo apt update && sudo apt upgrade -y
sudo timedatectl set-timezone America/Maceio   # horário de Sergipe (UTC-3)
```

Crie um usuário próprio para rodar o sistema, sem ser o root:

```bash
sudo adduser --disabled-password --gecos "COSUP+" cosup
```

Ligue o firewall deixando passar só o SSH e o Nginx:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

> As portas 3001 (back) e 5432 (banco) **não** são abertas. Só o próprio servidor fala com elas.

---

## 2. Instalar os programas

### Node.js 24 (a mesma versão usada no desenvolvimento)

```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install -y nodejs
node -v    # deve mostrar v24.x
npm -v
```

### PostgreSQL, Nginx, Git e ferramentas de compilação

```bash
sudo apt install -y postgresql postgresql-contrib nginx git build-essential
```

O `build-essential` é necessário porque o `bcrypt` e o `argon2` têm partes nativas, que às vezes precisam ser compiladas na instalação.

---

## 3. Criar o banco de dados

Gere uma senha forte para o banco e **guarde-a**:

```bash
openssl rand -base64 24
```

Crie o usuário e o banco. Troque `SENHA_DO_BANCO` pela senha gerada:

```bash
sudo -u postgres psql <<'SQL'
CREATE USER cosup WITH PASSWORD 'SENHA_DO_BANCO';
CREATE DATABASE cosupmais OWNER cosup;
SQL
```

O PostgreSQL do Ubuntu já vem escutando só em `localhost`, então não é preciso mexer em `postgresql.conf` nem em `pg_hba.conf`.

---

## 4. Baixar o código

Os repositórios ficam em `/opt/cosupmais`, como propriedade do usuário `cosup`:

```bash
sudo mkdir -p /opt/cosupmais
sudo chown cosup:cosup /opt/cosupmais
sudo -iu cosup
cd /opt/cosupmais
git clone https://github.com/sergioamado/Gestio_back.git back
git clone https://github.com/sergioamado/Gestio_front.git front
```

> Se os repositórios forem privados, o `git clone` pede login. Use seu usuário do GitHub e, no lugar da senha, um **Personal Access Token** (GitHub → Settings → Developer settings → Personal access tokens) com permissão de leitura.

Os passos 5 e 7 continuam como usuário `cosup`. Os comandos com `sudo` voltam a ser rodados com o seu usuário normal (digite `exit` para sair do `cosup`).

---

## 5. Configurar o back

```bash
cd /opt/cosupmais/back
git checkout main
```

### 5.1 Arquivo `.env`

Gere um segredo para o JWT, que assina os logins:

```bash
openssl rand -hex 48
```

Crie o arquivo `/opt/cosupmais/back/.env`:

```bash
nano .env
```

Conteúdo, trocando os valores:

```ini
# Banco (senha do passo 3)
DATABASE_URL="postgresql://cosup:SENHA_DO_BANCO@localhost:5432/cosupmais?schema=public"

# Segredo dos logins (resultado do openssl rand -hex 48)
JWT_SECRET="COLE_AQUI_O_SEGREDO"

# Porta interna do back (o Nginx repassa para ela)
PORT=3001

# Endereço do sistema, usado nos links das mensagens do Telegram
FRONTEND_URL="https://cosupmais.ufs.br"

# Bot do Telegram (deixe vazio para desligar)
TELEGRAM_BOT_TOKEN="123456:ABC..."
TELEGRAM_BOT_USERNAME="NomeDoBot"
```

Proteja o arquivo:

```bash
chmod 600 .env
```

> **Atenção com o Telegram:** o bot usa *polling*, e só **um** lugar pode usar o mesmo token ao mesmo tempo. Se o back de desenvolvimento estiver rodando no seu computador com o mesmo token, os dois brigam e aparece o erro `409 Conflict`. Use um bot só para produção, ou deixe `TELEGRAM_BOT_TOKEN` vazio no `.env` de desenvolvimento.

> O `SHADOW_DATABASE_URL` do `.env` de desenvolvimento **não** é usado em produção, porque o `migrate deploy` não usa banco sombra.

### 5.2 Instalar, criar as tabelas e compilar

```bash
npm ci                       # instala exatamente as versões do package-lock.json
npx prisma generate          # gera o cliente do banco
npx prisma migrate deploy    # cria todas as tabelas (aplica as migrações)
npm run build                # compila o TypeScript para dist/
```

> Use `npm ci` completo, **sem** `--omit=dev`: o `prisma` (necessário para as migrações) e o `tsx` (usado para criar o admin) são dependências de desenvolvimento.

### 5.3 Criar o administrador

```bash
npx prisma db seed
```

Isso cria o usuário **admin** com a senha **admin123**. **Troque essa senha no primeiro acesso**, no menu do usuário → Trocar senha.

### 5.4 Pasta das fotos

```bash
mkdir -p uploads/patrimonio
```

### 5.5 Teste rápido

```bash
node dist/server.js
# deve aparecer: 🚀 Servidor Express e WebSockets rodando na porta 3001
```

Pare com `Ctrl+C`. Saia do usuário `cosup` com `exit`.

### 5.6 Trazer os dados que você já tem (opcional)

Se quiser levar para a produção os dados do banco atual (usuários, unidades, estoque, OS, patrimônio), faça isto **no lugar** do 5.3.

No computador atual, gere o dump. Use os dados do seu `.env` local:

```bash
pg_dump --no-owner --no-acl -Fc -h localhost -U <usuario_local> -d <banco_local> -f cosupmais.dump
```

Copie o dump e as fotos para o servidor:

```bash
scp cosupmais.dump usuario@IP_DO_SERVIDOR:/tmp/
scp -r ~/Documentos/GITHUB/Gestio_back/uploads/patrimonio usuario@IP_DO_SERVIDOR:/tmp/
```

No servidor, restaure num banco **vazio**. Se já rodou o `migrate deploy`, apague e recrie o banco antes:

```bash
sudo -u postgres psql -c "DROP DATABASE cosupmais;" -c "CREATE DATABASE cosupmais OWNER cosup;"
pg_restore --no-owner -h localhost -U cosup -d cosupmais /tmp/cosupmais.dump
sudo -iu cosup bash -c "cd /opt/cosupmais/back && npx prisma migrate deploy"   # aplica o que faltar
sudo cp -r /tmp/patrimonio/* /opt/cosupmais/back/uploads/patrimonio/
sudo chown -R cosup:cosup /opt/cosupmais/back/uploads
```

> O banco local tem dados de teste: OS com GLPI 999001/999002 canceladas e bens `TESTE-PAT-*` e `TESTE-RA-*`. Apague-os antes do dump, ou comece com o banco limpo do passo 5.3.

---

## 6. Deixar o back rodando sempre (systemd)

Crie o serviço:

```bash
sudo nano /etc/systemd/system/cosupmais-back.service
```

```ini
[Unit]
Description=COSUP+ back (Express + Socket.IO)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=cosup
WorkingDirectory=/opt/cosupmais/back
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Ligue e confira:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now cosupmais-back
sudo systemctl status cosupmais-back      # deve estar "active (running)"
curl -s http://127.0.0.1:3001/api/unidades   # deve responder com erro de "token", sinal de que o back está de pé
```

Para ver o log em tempo real:

```bash
sudo journalctl -u cosupmais-back -f
```

O serviço sobe sozinho quando o servidor liga e reinicia sozinho se cair.

---

## 7. Configurar e compilar o front

```bash
sudo -iu cosup
cd /opt/cosupmais/front
git checkout master
```

Crie o arquivo `.env.production` com o endereço da API:

```bash
echo 'VITE_API_URL=https://cosupmais.ufs.br/api' > .env.production
```

> Esse endereço vai **dentro** do front compilado. Se o endereço mudar, é preciso compilar de novo. Se você ainda não tem HTTPS (passo 9), use `http://cosupmais.ufs.br/api` por enquanto e compile de novo depois.

Compile:

```bash
npm ci
npm run build      # gera a pasta dist/
exit
```

Publique os arquivos onde o Nginx vai ler:

```bash
sudo mkdir -p /var/www/cosupmais
sudo rsync -a --delete /opt/cosupmais/front/dist/ /var/www/cosupmais/
sudo chown -R www-data:www-data /var/www/cosupmais
```

---

## 8. Configurar o Nginx para `cosupmais.ufs.br`

```bash
sudo nano /etc/nginx/sites-available/cosupmais
```

```nginx
server {
    listen 80;
    server_name cosupmais.ufs.br;

    # Planilhas do SIPAC e fotos do patrimônio (o back aceita até 20 MB)
    client_max_body_size 25M;

    # Front (React): os arquivos compilados
    root /var/www/cosupmais;
    index index.html;

    # Rotas do React (ex.: /patrimonio, /solicitacoes) caem no index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Arquivos com hash no nome podem ficar em cache por muito tempo
    location /assets/ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 120s;     # relatórios grandes e importação do SIPAC
    }

    # Tempo real e notificações (WebSocket)
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 3600s;    # mantém a conexão aberta
    }

    # Fotos do patrimônio (o back exige login)
    location /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
    }
}
```

Ative o site, desligue o site padrão e recarregue:

```bash
sudo ln -s /etc/nginx/sites-available/cosupmais /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t                  # deve dizer "syntax is ok" e "test is successful"
sudo systemctl reload nginx
```

A partir daqui, `http://cosupmais.ufs.br` já abre o sistema, desde que o DNS ou o arquivo de hosts aponte para o servidor.

---

## 9. Ativar o HTTPS

O HTTPS é **necessário**: as notificações do navegador só funcionam em `https://` e as senhas não podem trafegar abertas. Escolha um dos caminhos.

### Opção A: o servidor é acessível pela internet (Let's Encrypt, grátis)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d cosupmais.ufs.br
```

O certbot pede um e-mail e ajusta sozinho o Nginx, incluindo o redirecionamento de `http` para `https`. A renovação é automática, e dá para testar com:

```bash
sudo certbot renew --dry-run
```

### Opção B: o servidor só é acessível na rede da UFS

O Let's Encrypt precisa enxergar o servidor pela internet. Se ele for só interno, peça à STI um **certificado para `cosupmais.ufs.br`**: a UFS costuma ter um certificado institucional, às vezes coringa `*.ufs.br`. Copie os arquivos para o servidor:

```bash
sudo mkdir -p /etc/ssl/cosupmais
# copie para lá: cosupmais.crt (certificado + cadeia) e cosupmais.key (chave)
sudo chmod 600 /etc/ssl/cosupmais/cosupmais.key
```

No arquivo `/etc/nginx/sites-available/cosupmais`, troque `listen 80;` por:

```nginx
    listen 443 ssl;
    http2 on;
    ssl_certificate     /etc/ssl/cosupmais/cosupmais.crt;
    ssl_certificate_key /etc/ssl/cosupmais/cosupmais.key;
```

Acrescente no fim do arquivo o redirecionamento:

```nginx
server {
    listen 80;
    server_name cosupmais.ufs.br;
    return 301 https://$host$request_uri;
}
```

Depois recarregue:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

### Depois do HTTPS

Se o front foi compilado com `http://`, ajuste o endereço e compile de novo (passo 7):

```bash
sudo -iu cosup bash -c "cd /opt/cosupmais/front && echo 'VITE_API_URL=https://cosupmais.ufs.br/api' > .env.production && npm run build"
sudo rsync -a --delete /opt/cosupmais/front/dist/ /var/www/cosupmais/
```

---

## 10. Testar

Abra `https://cosupmais.ufs.br` e confira:

1. **Login** com `admin` / `admin123`, e troca da senha.
2. Em **Unidades**, cadastre as unidades (COSUP, DCOMP...). Em **Usuários**, cadastre gerentes e técnicos.
3. **Tempo real:** abra o sistema em dois navegadores, um com o técnico e outro com o gerente.
   - O técnico abre uma OS.
   - O gerente deve receber a notificação e ver a OS aparecer **sem apertar F5**.
4. **Fotos:** cadastre um bem com foto e confira que a foto aparece.
5. **Importação do SIPAC:** importe uma planilha.
6. **Telegram:** em Configurar notificações, vincule o Telegram e confira se a mensagem chega com o link `https://cosupmais.ufs.br/...`.
7. **Celular:** abra no celular pela rede (Wi-Fi da UFS).

Se o tempo real não funcionar, abra o console do navegador (F12). Erros em `/socket.io/` quase sempre são o bloco `location /socket.io/` do Nginx faltando ou errado.

---

## 11. Backup automático

Faça backup diário do banco e das fotos, mantendo 14 dias:

```bash
sudo mkdir -p /var/backups/cosupmais
sudo chown postgres:postgres /var/backups/cosupmais
sudo nano /etc/cron.d/cosupmais-backup
```

```cron
# Todo dia às 02:00: banco e fotos do patrimônio
0 2 * * * postgres pg_dump -Fc cosupmais > /var/backups/cosupmais/banco-$(date +\%F).dump
5 2 * * * root tar -czf /var/backups/cosupmais/uploads-$(date +\%F).tar.gz -C /opt/cosupmais/back uploads
30 2 * * * root find /var/backups/cosupmais -type f -mtime +14 -delete
```

> Guarde uma cópia **fora** do servidor, num compartilhamento da UFS ou num HD externo. Um backup que fica só na mesma máquina se perde junto com ela.

Para **restaurar** um backup:

```bash
sudo systemctl stop cosupmais-back
sudo -u postgres pg_restore --clean --if-exists -d cosupmais /var/backups/cosupmais/banco-AAAA-MM-DD.dump
sudo systemctl start cosupmais-back
```

---

## 12. Atualizar o sistema (novas versões)

Depois de fazer o push de novas alterações no GitHub, rode no servidor:

```bash
# Back
sudo -iu cosup bash -c "cd /opt/cosupmais/back && git pull && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build"
sudo systemctl restart cosupmais-back

# Front
sudo -iu cosup bash -c "cd /opt/cosupmais/front && git pull && npm ci && npm run build"
sudo rsync -a --delete /opt/cosupmais/front/dist/ /var/www/cosupmais/
```

> O `prisma migrate deploy` só aplica as migrações novas, por exemplo `20261125180000_bem_atribuido_continua_ativo`, e nunca apaga dados. Mesmo assim, faça um backup antes de atualizar.

Para não digitar tudo isso, salve como script em `/opt/cosupmais/atualizar.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
sudo -u postgres pg_dump -Fc cosupmais > /var/backups/cosupmais/antes-atualizar-$(date +%F-%H%M).dump
sudo -iu cosup bash -c "cd /opt/cosupmais/back && git pull && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build"
sudo systemctl restart cosupmais-back
sudo -iu cosup bash -c "cd /opt/cosupmais/front && git pull && npm ci && npm run build"
sudo rsync -a --delete /opt/cosupmais/front/dist/ /var/www/cosupmais/
echo "✅ COSUP+ atualizado"
```

```bash
sudo chmod +x /opt/cosupmais/atualizar.sh
sudo /opt/cosupmais/atualizar.sh
```

Quem já estiver com o sistema aberto recebe a versão nova ao recarregar a página.

---

## 13. Problemas comuns

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| `cosupmais.ufs.br` não abre | DNS ainda não criado ou firewall | Teste com `ping cosupmais.ufs.br` e `sudo ufw status`; use o arquivo de hosts enquanto o DNS não sai |
| Página abre, mas o login dá "erro de rede" | `VITE_API_URL` errado no build do front | Confira o `.env.production` e compile de novo (passo 7) |
| **502 Bad Gateway** | Back parado | `sudo systemctl status cosupmais-back` e `sudo journalctl -u cosupmais-back -n 50` |
| Back não sobe: `Can't reach database` | `DATABASE_URL` errado ou PostgreSQL parado | Confira a senha no `.env`; `sudo systemctl status postgresql` |
| `npx prisma migrate deploy` ou `db seed` não existe | Instalou com `--omit=dev` | Rode `npm ci` sem opções |
| Login funciona, mas todos são deslogados | `JWT_SECRET` mudou | Normal depois de trocar o segredo: basta entrar de novo |
| Notificações e tempo real não chegam | Bloco `/socket.io/` do Nginx ausente | Confira o passo 8 e rode `sudo nginx -t` |
| Notificação do navegador não aparece | Site sem HTTPS | Faça o passo 9 |
| Telegram: `409 Conflict` no log | Outro back usando o mesmo token | Desligue o bot no ambiente de desenvolvimento ou use outro bot |
| Upload de foto ou planilha dá **413** | Limite do Nginx | Confira o `client_max_body_size 25M;` |
| F5 numa página interna dá **404** | Falta o `try_files` | Confira o bloco `location /` do passo 8 |
| Foto do patrimônio não aparece | Pasta `uploads` sem permissão ou não copiada | `sudo chown -R cosup:cosup /opt/cosupmais/back/uploads` |

## Comandos do dia a dia

```bash
sudo systemctl status cosupmais-back     # está rodando?
sudo systemctl restart cosupmais-back    # reiniciar o back
sudo journalctl -u cosupmais-back -f     # log do back em tempo real
sudo tail -f /var/log/nginx/error.log    # erros do Nginx
sudo -u postgres psql cosupmais          # entrar no banco
```
