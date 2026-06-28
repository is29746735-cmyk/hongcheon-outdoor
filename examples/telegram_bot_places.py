"""
홍천 아웃도어 공개 API를 텔레그램 봇에서 사용하는 예제.

이 사이트(홍천 아웃도어)는 봇들이 호출할 수 있는 공개 데이터 백엔드
(`GET /api/places`)를 제공합니다. 아래 `fetch_places()` 함수만 복사해도
어느 봇에서든 홍천 캠핑·낚시·차박 장소 데이터를 가져올 수 있습니다.

필요 패키지:
    pip install requests
    pip install "python-telegram-bot>=20"   # 텔레그램 연동 부분에만 필요

실행 (텔레그램 봇):
    # 토큰은 BotFather에서 발급. 절대 코드/깃에 직접 넣지 말 것!
    export TELEGRAM_BOT_TOKEN="123456:abc..."
    python telegram_bot_places.py

데이터만 확인 (텔레그램 없이):
    python -c "import telegram_bot_places as m; print(m.fetch_places(featured=True))"
"""

import os

import requests

# 프로덕션 기본값. 로컬 개발 서버로 시험할 땐 환경변수로 덮어쓰기:
#   export HONGCHEON_API_BASE=http://localhost:3000
API_BASE = os.environ.get(
    "HONGCHEON_API_BASE", "https://hongcheon-outdoor-kv6c.vercel.app"
)


def fetch_places(category=None, q=None, featured=False, timeout=5):
    """홍천 아웃도어 장소 목록을 가져온다.

    category : "camping" | "fishing" | "carcamping"  (생략 시 전체)
    q        : 검색어 (이름·소개·태그에서 포함 검색)
    featured : True 면 추천(featured) 장소만
    반환     : 장소 dict 리스트. 각 항목 주요 필드:
               id, name, category, summary, region, phone, location,
               tags, activities, official, connectedFishing, sourceUrl, mapQuery
    """
    params = {}
    if category:
        params["category"] = category
    if q:
        params["q"] = q
    if featured:
        params["featured"] = "true"

    res = requests.get(f"{API_BASE}/api/places", params=params, timeout=timeout)
    res.raise_for_status()
    return res.json().get("places", [])


def format_place(p):
    """장소 한 곳을 채팅 메시지용 한 줄로 정리."""
    phone = f" · ☎ {p['phone']}" if p.get("phone") else ""
    return f"📍 {p['name']} — {p['summary']}{phone}"


# ── 여기부터는 텔레그램 연동 예시 (python-telegram-bot v20+) ────────────────
# 데이터 호출(fetch_places)만 필요하면 아래 main()은 무시해도 됩니다.
def main():
    from telegram import Update
    from telegram.ext import Application, CommandHandler, ContextTypes

    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        raise SystemExit(
            "TELEGRAM_BOT_TOKEN 환경변수를 설정하세요. (토큰은 코드/깃에 넣지 말 것)"
        )

    async def camping(update: Update, context: ContextTypes.DEFAULT_TYPE):
        """/camping → 추천 캠핑장 목록"""
        places = fetch_places(category="camping", featured=True)
        if not places:
            await update.message.reply_text("지금은 가져올 캠핑장이 없어요.")
            return
        lines = [format_place(p) for p in places]
        await update.message.reply_text("홍천 추천 캠핑장 ⛺\n\n" + "\n".join(lines))

    async def search(update: Update, context: ContextTypes.DEFAULT_TYPE):
        """/search 쏘가리 → 키워드 검색 (상위 5곳)"""
        keyword = " ".join(context.args).strip()
        if not keyword:
            await update.message.reply_text("예: /search 쏘가리")
            return
        places = fetch_places(q=keyword)
        if not places:
            await update.message.reply_text(f"'{keyword}' 결과가 없어요.")
            return
        lines = [format_place(p) for p in places[:5]]
        await update.message.reply_text(
            f"'{keyword}' 검색 결과 🔎\n\n" + "\n".join(lines)
        )

    app = Application.builder().token(token).build()
    app.add_handler(CommandHandler("camping", camping))
    app.add_handler(CommandHandler("search", search))
    print("봇 실행 중… (Ctrl+C 로 종료)")
    app.run_polling()


if __name__ == "__main__":
    main()
