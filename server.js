const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

loadEnvFile();

const port = Number(process.env.PORT || 3000);
const rootDirectory = __dirname;
const openAiBaseUrl = (
  process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"
).replace(/\/$/, "");
const openAiModel = process.env.OPENAI_MODEL || "gpt-4o-mini";
const systemPrompt = `Bạn là Mộc Miên AI, trợ lý tư vấn sách của nhà sách Mộc Miên. Luôn trả lời bằng tiếng Việt, thân thiện, ngắn gọn và hữu ích. Chỉ tư vấn trong phạm vi sách, đơn hàng và dịch vụ của cửa hàng; nếu không biết, hãy nói rõ là cần nhân viên hỗ trợ, không tự bịa thông tin.

Catalog hiện có:
- Nhà giả kim - Paulo Coelho - 89.000đ - Văn học
- Đi tìm lẽ sống - Viktor E. Frankl - 105.000đ - Phát triển bản thân
- Rừng Na Uy - Haruki Murakami - 128.000đ - Văn học
- Atomic Habits - James Clear - 139.000đ - Phát triển bản thân
- Tâm lý học về tiền - Morgan Housel - 119.000đ - Kinh tế
- Những ngày thơ ấu - Nguyên Hồng - 72.000đ - Văn học
- Khu vườn bí mật - Frances Hodgson - 95.000đ - Thiếu nhi
- Nghệ thuật tinh tế - Mark Manson - 115.000đ - Phát triển bản thân

Chính sách: miễn phí giao hàng từ 299.000đ; đơn dưới mức đó phí từ 25.000đ; nội thành giao 1-2 ngày, tỉnh khác 3-5 ngày; đổi trả trong 7 ngày nếu sách lỗi hoặc hư hỏng; thanh toán chuyển khoản, ví điện tử hoặc COD. Không khẳng định tồn kho, trạng thái đơn hay thông tin cá nhân nếu chưa có dữ liệu từ hệ thống.`;

function loadEnvFile() {
  const envPath = path.join(__dirname, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100000) request.destroy(new Error("Request quá lớn"));
    });
    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Dữ liệu gửi lên không hợp lệ"));
      }
    });
    request.on("error", reject);
  });
}

async function handleChat(request, response) {
  if (
    !process.env.OPENAI_API_KEY ||
    process.env.OPENAI_API_KEY === "sk-your-api-key-here"
  ) {
    return sendJson(response, 503, {
      error: "Chưa cấu hình OPENAI_API_KEY trong file .env",
    });
  }
  try {
    const body = await readJson(request);
    const messages = Array.isArray(body.messages)
      ? body.messages
          .filter(
            (message) =>
              ["user", "assistant"].includes(message.role) &&
              typeof message.content === "string",
          )
          .slice(-20)
      : [];
    if (!messages.length)
      return sendJson(response, 400, { error: "Tin nhắn không được để trống" });

    const apiResponse = await fetch(`${openAiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: openAiModel,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 350,
      }),
    });
    const data = await apiResponse.json();
    if (!apiResponse.ok) {
      const providerError = data.error?.message || "Nhà cung cấp AI trả về lỗi";
      return sendJson(response, apiResponse.status >= 500 ? 502 : 400, {
        error: providerError,
      });
    }
    const message = data.choices?.[0]?.message?.content?.trim();
    if (!message)
      return sendJson(response, 502, { error: "AI không trả về nội dung" });
    return sendJson(response, 200, { message });
  } catch (error) {
    return sendJson(response, 500, { error: error.message || "Lỗi máy chủ" });
  }
}

function serveStatic(request, response) {
  const requestedPath = decodeURIComponent(request.url.split("?")[0]);
  const relativePath =
    requestedPath === "/" ? "index.html" : requestedPath.slice(1);
  const filePath = path.resolve(rootDirectory, relativePath);
  if (
    !filePath.startsWith(rootDirectory) ||
    !fs.existsSync(filePath) ||
    fs.statSync(filePath).isDirectory()
  ) {
    return sendJson(response, 404, { error: "Không tìm thấy tài nguyên" });
  }
  const extensions = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
  };
  response.writeHead(200, {
    "Content-Type": `${extensions[path.extname(filePath)] || "application/octet-stream"}; charset=utf-8`,
  });
  fs.createReadStream(filePath).pipe(response);
}

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/chat")
    return handleChat(request, response);
  if (request.method === "GET") return serveStatic(request, response);
  return sendJson(response, 405, { error: "Method không được hỗ trợ" });
});

server.listen(port, () =>
  console.log(`Mộc Miên Books đang chạy tại http://localhost:${port}`),
);
