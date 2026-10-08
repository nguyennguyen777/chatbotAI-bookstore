# Mộc Miên Books

Website bán sách với trợ lý AI dùng OpenAI API.

## Chạy local

Yêu cầu Node.js 18 trở lên.

```powershell
Copy-Item .env.example .env
```

Mở file `.env`, thay `sk-your-api-key-here` bằng API key của bạn. Không đưa file `.env` lên git.

```powershell
npm start
```

Mở http://localhost:3000 trong trình duyệt.

## Cấu hình AI

- `OPENAI_API_KEY`: API key bắt buộc.
- `OPENAI_MODEL`: mặc định `gpt-4o-mini`.
- `OPENAI_BASE_URL`: mặc định `https://api.openai.com/v1`, có thể đổi sang endpoint OpenAI-compatible.
- `PORT`: mặc định `3000`.

Frontend không chứa API key. Tất cả request chat đi qua `server.js` tại `POST /api/chat`.
