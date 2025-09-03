
const fetch = require("node-fetch");

const POLLINATIONS_API = "https://text.pollinations.ai";

exports.handler = async (event) => {
  try {
    const { text } = JSON.parse(event.body);

    const res = await fetch(POLLINATIONS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await res.text();
    return { statusCode: 200, body: JSON.stringify({ result: data }) };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
