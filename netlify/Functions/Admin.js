exports.handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      return {
        statusCode: 200,
        body: JSON.stringify({
          users: 0,
          messages: 0,
          channels: ["@YourChannelHere", "@YourGroupHere"]
        }),
      };
    }

    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body || "{}");
      return { statusCode: 200, body: JSON.stringify({ success: true, saved: body }) };
    }

    return { statusCode: 405, body: "Method Not Allowed" };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  }
};
