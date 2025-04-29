'use client';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#b7c8f6] to-[#e0d6f6]">
            <div className="text-center p-8 bg-white rounded-[20px] shadow-lg">
                <h2 className="text-2xl font-bold text-purple-600 mb-4">证书未找到</h2>
                <p className="text-gray-600 mb-4">请返回首页，选择活动期和输入昵称后查询证书。</p>
                <a href="/" className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    返回首页
                </a>
            </div>
        </div>
    );
} 