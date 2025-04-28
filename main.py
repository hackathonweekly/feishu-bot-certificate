from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
import uvicorn
import os
from api.certificate import router as certificate_router

# 创建FastAPI应用
app = FastAPI(title="活动证书服务")

# 获取当前文件所在目录
current_dir = os.path.dirname(os.path.abspath(__file__))

# 挂载静态资源
app.mount("/public", StaticFiles(directory=os.path.join(current_dir, "public")), name="public")

# 直接访问证书页面
@app.get("/", response_class=HTMLResponse)
async def certificate():
    with open(os.path.join("index.html"), "r", encoding="utf-8") as f:
        content = f.read()
    return content

# 直接访问证书页面
@app.get("/certificate", response_class=HTMLResponse)
async def certificate():
    with open(os.path.join("certificate.html"), "r", encoding="utf-8") as f:
        content = f.read()
    return content

app.include_router(certificate_router)

if __name__ == "__main__":
    print("请访问: http://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000) 