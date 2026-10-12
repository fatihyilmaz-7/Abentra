#!/usr/bin/env bash

# ==============================================================================
# ABENTRA International - Standalone Process & Service Manager
# ==============================================================================
# Bu script mevcut uygulama kodlarından tamamen bağımsızdır (standalone).
# Node.js sürecini arka planda başlatır, durdurur, yeniden başlatır,
# durumunu raporlar ve logları canlı/statik olarak görüntüler.
# ==============================================================================

# Scriptin bulunduğu dizin (Proje kök dizini)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="$PROJECT_DIR/logs"
PID_FILE="$LOG_DIR/app.pid"
LOG_FILE="$LOG_DIR/app.log"
ENTRY_POINT="$PROJECT_DIR/server.js"

# Port tespiti (.env varsa oku, yoksa varsayılan 3000)
DEFAULT_PORT=3000
if [ -f "$PROJECT_DIR/.env" ]; then
  ENV_PORT=$(grep -E '^PORT=' "$PROJECT_DIR/.env" | cut -d '=' -f2 | tr -d ' "\r')
  PORT="${ENV_PORT:-$DEFAULT_PORT}"
else
  PORT=$DEFAULT_PORT
fi

# Renkler & Biçimlendirme
C_RESET="\033[0m"
C_BOLD="\033[1m"
C_GOLD="\033[38;5;220m"
C_NAVY="\033[38;5;32m"
C_GREEN="\033[38;5;48m"
C_RED="\033[38;5;203m"
C_YELLOW="\033[38;5;214m"
C_GRAY="\033[38;5;244m"
C_CYAN="\033[38;5;45m"

print_banner() {
  echo -e "${C_GOLD}====================================================================${C_RESET}"
  echo -e "${C_BOLD}${C_GOLD}  ABENTRA International ${C_RESET}${C_GRAY}| Bağımsız Servis Yöneticisi${C_RESET}"
  echo -e "${C_GOLD}====================================================================${C_RESET}"
}

ensure_log_dir() {
  if [ ! -d "$LOG_DIR" ]; then
    mkdir -p "$LOG_DIR"
  fi
}

get_pid() {
  if [ -f "$PID_FILE" ]; then
    local pid
    pid=$(cat "$PID_FILE" 2>/dev/null | tr -d ' \n\r')
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "$pid"
      return 0
    fi
  fi
  # PID dosyası yoksa veya geçersizse port dinleyen süreci bul
  local port_pid
  port_pid=$(lsof -ti :"$PORT" -sTCP:LISTEN 2>/dev/null | head -n 1)
  if [ -n "$port_pid" ]; then
    echo "$port_pid"
    return 0
  fi
  return 1
}

# ------------------------------------------------------------------------------
# START COMMAND
# ------------------------------------------------------------------------------
cmd_start() {
  print_banner
  local existing_pid
  existing_pid=$(get_pid)

  if [ -n "$existing_pid" ]; then
    echo -e "${C_YELLOW}[!] Proje zaten çalışıyor!${C_RESET}"
    echo -e "    PID     : ${C_BOLD}$existing_pid${C_RESET}"
    echo -e "    Port    : ${C_BOLD}$PORT${C_RESET}"
    echo -e "    URL     : ${C_CYAN}http://localhost:$PORT${C_RESET}"
    echo -e "    Admin   : ${C_CYAN}http://localhost:$PORT/admin${C_RESET}"
    echo -e "\nLogları izlemek için: ${C_BOLD}./manage.sh logs -f${C_RESET}"
    return 0
  fi

  # Node kurulu mu kontrol et
  if ! command -v node >/dev/null 2>&1; then
    echo -e "${C_RED}[HATA] Sistemde 'node' (Node.js) bulunamadı! Lütfen Node.js kurun.${C_RESET}"
    return 1
  fi

  if [ ! -f "$ENTRY_POINT" ]; then
    echo -e "${C_RED}[HATA] Başlatılacak dosya bulunamadı: $ENTRY_POINT${C_RESET}"
    return 1
  fi

  ensure_log_dir

  echo -e "${C_NAVY}[*] Abentra sunucusu başlatılıyor...${C_RESET}"
  echo -e "    Dizin       : $PROJECT_DIR"
  echo -e "    Giriş Dosyası: server.js"
  echo -e "    Log Dosyası : $LOG_FILE"

  # Süreci tamamen bağımsız (detached daemon) oturumda başlat
  node -e "
    const fs = require('fs');
    const { spawn } = require('child_process');
    const out = fs.openSync('$LOG_FILE', 'a');
    const child = spawn('node', ['$ENTRY_POINT'], {
      cwd: '$PROJECT_DIR',
      detached: true,
      stdio: ['ignore', out, out]
    });
    fs.writeFileSync('$PID_FILE', String(child.pid));
    child.unref();
  "

  # Başlamasını 2 saniye bekle ve doğrula
  sleep 2

  local new_pid
  new_pid=$(cat "$PID_FILE" 2>/dev/null | tr -d ' \n\r')

  if [ -n "$new_pid" ] && kill -0 "$new_pid" 2>/dev/null; then
    echo -e "${C_GREEN}[✓] Servis başarıyla başlatıldı!${C_RESET}"
    echo -e "    PID     : ${C_BOLD}${C_GREEN}$new_pid${C_RESET}"
    echo -e "    Port    : ${C_BOLD}$PORT${C_RESET}"
    echo -e "    Web     : ${C_CYAN}http://localhost:$PORT/${C_RESET}"
    echo -e "    Admin   : ${C_CYAN}http://localhost:$PORT/admin${C_RESET}"
    echo -e "\nLogları görüntülemek için: ${C_BOLD}./manage.sh logs -f${C_RESET}"
  else
    echo -e "${C_RED}[HATA] Süreç başlatılamadı veya hemen kapandı! Son loglar:${C_RESET}"
    tail -n 15 "$LOG_FILE" 2>/dev/null
    rm -f "$PID_FILE"
    return 1
  fi
}

# ------------------------------------------------------------------------------
# STOP COMMAND
# ------------------------------------------------------------------------------
cmd_stop() {
  print_banner
  local target_pid
  target_pid=$(get_pid)

  if [ -z "$target_pid" ]; then
    echo -e "${C_GRAY}[i] Çalışan aktif bir Abentra servisi bulunamadı.${C_RESET}"
    rm -f "$PID_FILE"
    return 0
  fi

  echo -e "${C_YELLOW}[*] Servis durduruluyor (PID: $target_pid)...${C_RESET}"
  kill -15 "$target_pid" 2>/dev/null

  # Graceful kapanmayı bekle (en fazla 5 saniye)
  local waited=0
  while kill -0 "$target_pid" 2>/dev/null && [ "$waited" -lt 5 ]; do
    sleep 1
    waited=$((waited + 1))
    echo -e "    Bekleniyor... (${waited}s)"
  done

  # Kapanmadıysa zorla sonlandır
  if kill -0 "$target_pid" 2>/dev/null; then
    echo -e "${C_RED}[!] Süreç yanıt vermedi, zorla sonlandırılıyor (SIGKILL)...${C_RESET}"
    kill -9 "$target_pid" 2>/dev/null
    sleep 1
  fi

  # Portta kalan başka bir dinleyici var mı kontrol et
  local lingering_pid
  lingering_pid=$(lsof -ti :"$PORT" -sTCP:LISTEN 2>/dev/null)
  if [ -n "$lingering_pid" ]; then
    echo -e "${C_YELLOW}[!] Port $PORT üzerinde kalan süreç temizleniyor (PID: $lingering_pid)...${C_RESET}"
    kill -9 "$lingering_pid" 2>/dev/null
  fi

  rm -f "$PID_FILE"
  echo -e "${C_GREEN}[✓] Abentra servisi başarıyla durduruldu.${C_RESET}"
}

# ------------------------------------------------------------------------------
# RESTART COMMAND
# ------------------------------------------------------------------------------
cmd_restart() {
  print_banner
  echo -e "${C_CYAN}[*] Yeniden başlatma işlemi başlatılıyor...${C_RESET}\n"
  cmd_stop
  echo ""
  sleep 1
  cmd_start
}

# ------------------------------------------------------------------------------
# STATUS COMMAND
# ------------------------------------------------------------------------------
cmd_status() {
  print_banner
  local pid
  pid=$(get_pid)

  if [ -n "$pid" ]; then
    echo -e "  Durum        : ${C_BOLD}${C_GREEN}● ÇALIŞIYOR (RUNNING)${C_RESET}"
    echo -e "  PID          : ${C_BOLD}$pid${C_RESET}"
    echo -e "  Port         : ${C_BOLD}$PORT${C_RESET}"
    echo -e "  Web Adresi   : ${C_CYAN}http://localhost:$PORT/${C_RESET}"
    echo -e "  Admin Paneli : ${C_CYAN}http://localhost:$PORT/admin${C_RESET}"

    # macOS / Linux uyumlu ps kaynak kullanımı
    if ps -p "$pid" -o %cpu,%mem,etime 2>/dev/null | tail -n 1 | grep -q '[0-9]'; then
      local stats
      stats=$(ps -p "$pid" -o %cpu,%mem,etime 2>/dev/null | tail -n 1)
      local cpu=$(echo "$stats" | awk '{print $1}')
      local mem=$(echo "$stats" | awk '{print $2}')
      local uptime=$(echo "$stats" | awk '{print $3}')
      echo -e "  Kaynaklar    : CPU: %$cpu | RAM: %$mem | Çalışma Süresi: $uptime"
    fi

    echo -e "\n${C_GRAY}--- Son 3 Log Kaydı ---${C_RESET}"
    if [ -f "$LOG_FILE" ]; then
      tail -n 3 "$LOG_FILE"
    else
      echo -e "${C_GRAY}(Henüz log dosyası oluşmadı)${C_RESET}"
    fi
  else
    echo -e "  Durum        : ${C_BOLD}${C_RED}○ DURDURULDU (STOPPED)${C_RESET}"
    echo -e "  Port         : $PORT (Boşta)"
    echo -e "  Log Dosyası  : $LOG_FILE"
  fi
  echo -e "${C_GOLD}====================================================================${C_RESET}"
}

# ------------------------------------------------------------------------------
# LOGS COMMAND
# ------------------------------------------------------------------------------
cmd_logs() {
  ensure_log_dir
  if [ ! -f "$LOG_FILE" ]; then
    touch "$LOG_FILE"
  fi

  local flag="$1"
  local lines="${2:-50}"

  if [ "$flag" = "-f" ] || [ "$flag" = "--follow" ]; then
    echo -e "${C_GOLD}====================================================================${C_RESET}"
    echo -e "${C_BOLD}  ABENTRA Canlı Log Akışı ${C_RESET}${C_GRAY}(Çıkmak için Ctrl+C tuşlayın)${C_RESET}"
    echo -e "${C_GOLD}====================================================================${C_RESET}\n"
    tail -f -n 50 "$LOG_FILE"
  else
    echo -e "${C_GOLD}====================================================================${C_RESET}"
    echo -e "${C_BOLD}  ABENTRA Son $lines Log Satırı ${C_RESET}${C_GRAY}(Canlı takip için: ./manage.sh logs -f)${C_RESET}"
    echo -e "${C_GOLD}====================================================================${C_RESET}\n"
    tail -n "$lines" "$LOG_FILE"
  fi
}

# ------------------------------------------------------------------------------
# HELP / USAGE
# ------------------------------------------------------------------------------
cmd_help() {
  print_banner
  echo -e "Kullanım: ${C_BOLD}./manage.sh [komut]${C_RESET}\n"
  echo -e "Kullanılabilir Komutlar:"
  echo -e "  ${C_BOLD}${C_GREEN}start${C_RESET}       : Projeyi arka planda başlatır (port: $PORT)"
  echo -e "  ${C_BOLD}${C_RED}stop${C_RESET}        : Çalışan projeyi güvenli şekilde durdurur"
  echo -e "  ${C_BOLD}${C_CYAN}restart${C_RESET}     : Projeyi durdurup yeniden başlatır"
  echo -e "  ${C_BOLD}${C_YELLOW}status${C_RESET}      : Sürecin çalışma durumunu, PID ve kaynaklarını gösterir"
  echo -e "  ${C_BOLD}${C_GOLD}logs${C_RESET}        : Son 50 log satırını yazdırır"
  echo -e "  ${C_BOLD}${C_GOLD}logs -f${C_RESET}     : Logları canlı (realtime) olarak takip eder"
  echo -e "  ${C_BOLD}help${C_RESET}        : Bu yardım menüsünü görüntüler"
  echo -e "\nÖrnekler:"
  echo -e "  ${C_GRAY}./manage.sh start${C_RESET}"
  echo -e "  ${C_GRAY}./manage.sh status${C_RESET}"
  echo -e "  ${C_GRAY}./manage.sh logs -f${C_RESET}"
  echo -e "${C_GOLD}====================================================================${C_RESET}"
}

# ------------------------------------------------------------------------------
# MAIN ENTRY
# ------------------------------------------------------------------------------
ACTION="${1:-help}"

case "$ACTION" in
  start)
    cmd_start
    ;;
  stop)
    cmd_stop
    ;;
  restart)
    cmd_restart
    ;;
  status)
    cmd_status
    ;;
  logs|log)
    cmd_logs "$2" "$3"
    ;;
  help|--help|-h)
    cmd_help
    ;;
  *)
    echo -e "${C_RED}[!] Geçersiz komut: $ACTION${C_RESET}"
    cmd_help
    exit 1
    ;;
esac
