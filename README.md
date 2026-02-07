````md
# lk-dashboard — регламент работы (GitHub → Ubuntu deploy)

## Принцип
**GitHub = единственный источник истины.**  
На сервере (Ubuntu) код **не правим руками**, сервер только **деплоит** из GitHub командой `school-deploy`.

---

## Ежедневный цикл (VS Code / Windows)

### 0) Перейти в папку проекта
```bash
cd "C:\Users\mkud2\Downloads\обраховательнаяплатформа\lk-dashboard"
````

### 1) Перед началом работы (обязательно)

```bash
git status
git pull
```

### 2) Внести правки в VS Code

### 3) Проверить что изменилось

```bash
git status
```

### 4) Зафиксировать изменения (commit)

```bash
git add .
git commit -m "feat/fix: кратко что сделал"
```

### 5) Отправить на GitHub

```bash
git push
```

---

## Деплой на Ubuntu (после push)

### 6) Зайти на сервер и выполнить деплой

```bash
ssh admin@155.212.161.21
sudo /usr/local/bin/school-deploy
```

---

## Если `git push` не проходит (remote содержит новые коммиты)

### Сценарий A — ты один работаешь (самый частый)

Это значит: **где-то уже появился новый коммит в GitHub** (например, ты пушил с другого ПК/папки).
Делаем так:

```bash
git pull --rebase
git push
```

---

## Если `git pull` ругается: "You have unstaged changes"

Сначала сохрани локальные правки, подтяни репо, верни правки:

```bash
git stash push -u -m "wip"
git pull --rebase
git stash pop
```

Дальше снова:

```bash
git add .
git commit -m "..."
git push
```

---

## Зачем `git pull --rebase` (коротко)

**Причина:** на GitHub уже есть коммит, которого нет у тебя локально.
**Действие:** `--rebase` переносит твои локальные коммиты поверх новых, чтобы история была ровная (без лишних merge-коммитов).
Если ты всегда работаешь только с одного места и всегда `git pull` перед правками — `--rebase` почти не понадобится.

---

## Быстрые проверки на сервере (если нужно)

```bash
sudo -u admin pm2 status
sudo -u admin pm2 logs school-backend --lines 100
curl -i http://127.0.0.1:19421/api/health
```

```
::contentReference[oaicite:0]{index=0}
```
