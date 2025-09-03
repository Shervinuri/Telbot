const fetch = require("node-fetch");

const TELEGRAM_TOKEN = "7980330500:AAEm3i0-ItT-n6n3GKVw1fqxojtsIwryuAY";
const BOT_USERNAME = "@Minishenbot";
const POLLINATIONS_API = "https://text.pollinations.ai";

// لیست کانال‌ها/گروه‌های اجباری برای عضویت
const REQUIRED_CHANNELS = [
  "@aishervin", // اینجا کانال‌هات رو بذار
  "@YourGroupHere"
];

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    if (body.message) {
      const chatId = body.message.chat.id;
      const text = body.message.text || "";
      const userId = body.message.from.id;

      // چک جوین اجباری
      const joined = await checkUserMembership(userId);
      if (!joined) {
        await sendMessage(
          chatId,
          "⚠️ برای استفاده از ربات باید ابتدا عضو کانال‌های زیر بشی:\n\n" +
            REQUIRED_CHANNELS.map((c) => c).join("\n") +
            "\n\nبعد از عضویت دوباره /start رو بزن."
        );
        return { statusCode: 200, body: "Join required" };
      }

      // دستور start
      if (text === "/start") {
        await sendMessage(chatId, "👋 خوش اومدی!\nربات به حالت چت‌بات متنی تنظیم شد. هرچی بفرستی، جواب می‌گیرری.\n\nدستورات:\n/image → ساخت تصویر 🎨\n/custom → فرمان سفارشی 🔧");
      }

      // چت‌بات متنی (حالت دیفالت)
      if (!text.startsWith("/")) {
        const pollRes = await fetch(POLLINATIONS_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const pollData = await pollRes.text();
        await sendMessage(chatId, pollData);
      }

      // دستور ساخت تصویر
      if (text.startsWith("/image")) {
        await sendMessage(chatId, "🎨 لطفا استایل/مدل/مود رو انتخاب کنید...");
        // بعداً می‌تونی inline keyboard اضافه کنی
      }

      // دستورات رزرو
      if (text.startsWith("/custom")) {
        await sendMessage(chatId, "🔧 این دستور بعداً تعریف میشه...");
      }
    }

    return { statusCode: 200, body: "OK" };
  } catch (err) {
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
    const res = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getChatMember?chat_id=${channel}&user_id=${userId}`
    );
    const data = await res.json();
    if (!data.ok) return false;

    const status = data.result.status;
    if (status !== "member" && status !== "administrator" && status !== "creator") {
      return false;
    }
  }
  return true;
}
