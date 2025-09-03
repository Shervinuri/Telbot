const fetch = require("node-fetch");

const TELEGRAM_TOKEN = "7980330500:AAEm3i0-ItT-n6n3GKVw1fqxojtsIwryuAY";
const BOT_USERNAME = "@Minishenbot";
const POLLINATIONS_API = "https://text.pollinations.ai";

// کانال‌ها / گروه‌های اجباری
const REQUIRED_CHANNELS = [
  "@YourChannelHere",
  "@YourGroupHere"
];

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    if (!body.message) return { statusCode: 200, body: "No message" };

    const chatId = body.message.chat.id;
    const text = body.message.text || "";
    const userId = body.message.from.id;

    // چک جوین اجباری
    const joined = await checkUserMembership(userId);
    if (!joined) {
      await sendMessage(chatId, "⚠️ باید عضو کانال‌ها باشی:\n" + REQUIRED_CHANNELS.join("\n"));
      return { statusCode: 200, body: "Join required" };
    }

    // دستورات
    if (text === "/start") {
      await sendMessage(chatId, "👋 خوش آمدی! حالت پیش‌فرض چت‌بات متنی است.\nدستورات:\n/image → ساخت تصویر\n/custom → دستور رزرو");
    } else if (text.startsWith("/image")) {
      await sendMessage(chatId, "🎨 لطفا استایل و مدل را انتخاب کنید...");
    } else if (text.startsWith("/custom")) {
      await sendMessage(chatId, "🔧 این دستور بعداً تعریف می‌شود...");
    } else if (text) {
      // حالت پیش‌فرض → Pollinations
      const pollRes = await fetch(POLLINATIONS_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const pollData = await pollRes.text();
      await sendMessage(chatId, pollData);
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: err.toString() };
  }
};

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function checkUserMembership(userId) {
  for (const channel of REQUIRED_CHANNELS) {
    try {
      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/getChatMember?chat_id=${channel}&user_id=${userId}`);
      const data = await res.json();
      const status = data.result?.status;
      if (status !== "member" && status !== "administrator" && status !== "creator") return false;
    } catch (e) {
      return false;
    }
  }
  return true;
}
