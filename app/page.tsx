'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [periods, setPeriods] = useState<Array<{ id: number, period_name: string }>>([]);
    const [selectedPeriod, setSelectedPeriod] = useState("");
    const [nickname, setNickname] = useState("");
    const [certificate, setCertificate] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const certificateFrameRef = useRef<HTMLIFrameElement>(null);
    const router = useRouter();

    useEffect(() => {
        // 加载活动期名称
        const loadPeriods = async () => {
            try {
                const response = await fetch('/api/periods/completed');
                if (response.ok) {
                    const data = await response.json();
                    // 按 id 降序排序
                    data.sort((a: any, b: any) => a.id - b.id);
                    setPeriods(data);
                    // 自动选择第一个活动期作为默认值
                    if (data.length > 0) {
                        setSelectedPeriod(data[0].id.toString());
                    }
                    console.log('加载的活动期:', data);
                } else {
                    console.error('Error loading periods:', response.statusText);
                    setError('加载活动期数据失败，请稍后再试');
                }
            } catch (error) {
                console.error('Error loading periods:', error);
                setError('无法连接到服务器，请检查网络连接');
            }
        };

        loadPeriods();
    }, []);

    const queryCertificate = async () => {
        if (!selectedPeriod || !nickname.trim()) {
            setError('请选择活动期名并输入昵称');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/certificate?period_id=${selectedPeriod}&nickname=${encodeURIComponent(nickname.trim())}`);

            if (response.ok) {
                const data = await response.json();
                console.log('cer_content:', data.cer_content);

                if (data && data.cer_content) {
                    setCertificate(data.cer_content);

                    // 获取 period_name
                    const periodObj = periods.find(p => p.id.toString() === selectedPeriod);
                    const periodName = periodObj ? periodObj.period_name : '';

                    // 构建参数
                    const params = new URLSearchParams({
                        period: periodName,
                        nickname: nickname.trim(),
                        cerContent: data.cer_content
                    });

                    // 更新iframe的src
                    if (certificateFrameRef.current) {
                        certificateFrameRef.current.src = `/certificate?${params.toString()}`;
                    }
                } else {
                    setError('未找到证书');
                }
            } else if (response.status === 404) {
                setError('未找到证书');
            } else {
                setError('查询出错，请稍后再试');
            }
        } catch (error) {
            console.error('查询证书出错:', error);
            setError('查询出错，请稍后再试');
        } finally {
            setLoading(false);
        }
    };

    const captureScreenshot = () => {
        // 检查是否已经有证书数据
        if (!certificate || !selectedPeriod || !nickname) {
            alert('请先查询证书');
            return;
        }

        try {
            // 获取当前iframe的参数
            if (certificateFrameRef.current) {
                const iframeUrl = new URL(certificateFrameRef.current.src, window.location.origin);
                const params = new URLSearchParams(iframeUrl.search);

                // 确保所有参数存在
                const periodObj = periods.find(p => p.id.toString() === selectedPeriod);
                const periodName = periodObj ? periodObj.period_name : '';

                if (!periodName || !nickname.trim() || !certificate) {
                    alert('证书数据不完整，请重新查询');
                    return;
                }

                // 设置参数
                const newParams = new URLSearchParams({
                    period: periodName,
                    nickname: nickname.trim(),
                    cerContent: certificate,
                    autoSave: '1' // 添加自动保存参数
                });

                // 跳转到certificate页面
                router.push(`/certificate?${newParams.toString()}`);
            } else {
                // 证书预览未就绪
                alert('证书预览未就绪，请稍后再试');
            }
        } catch (error) {
            console.error('保存图片出错:', error);
            alert('保存图片出错，请稍后再试');
        }
    };

    useEffect(() => {
        // 监听来自iframe的消息
        const handleMessage = (event: MessageEvent) => {
            console.log('收到消息:', event.data);
            if (event.data && event.data.type === 'certificateImage' && event.data.imageData) {
                console.log('收到图片数据，准备下载');

                // 清除超时警告
                if ((window as any)._screenshotTimeoutId) {
                    clearTimeout((window as any)._screenshotTimeoutId);
                }

                // 收到iframe传来的图片数据，下载图片
                // const a = document.createElement('a');
                // a.href = event.data.imageData;
                // a.download = `certificate_${nickname.trim()}_${new Date().getTime()}.png`;
                // a.click();
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [nickname]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#b7c8f6] to-[#e0d6f6] p-5">
            <div className="container max-w-7xl mx-auto my-8 flex flex-col lg:flex-row bg-white rounded-[20px] shadow-[0_15px_30px_rgba(0,0,0,0.2)] overflow-hidden">
                {/* 左侧面板 */}
                <div className="w-full lg:w-1/3 p-8 bg-gradient-to-b from-[#f5f7fa] to-[#e4ecfb] shadow-[inset_-5px_0_15px_-5px_rgba(0,0,0,0.05)]">
                    <h2 className="text-[#6c5ce7] mb-6 text-2xl text-center pb-4 border-b-2 border-[rgba(108,92,231,0.2)] relative after:content-[''] after:absolute after:bottom-[-2px] after:left-1/2 after:transform after:-translate-x-1/2 after:w-20 after:h-[2px] after:bg-[#6c5ce7]">
                        证书查询
                    </h2>

                    <div className="mb-6">
                        <label htmlFor="periodSelect" className="block mb-2 font-bold text-[#6c5ce7] text-base">
                            活动期名
                        </label>
                        <select
                            id="periodSelect"
                            className="w-full p-3 border border-[#ddd] rounded-[10px] text-base bg-white shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-300 focus:outline-none focus:border-[#6c5ce7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.2)]"
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                        >
                            <option value="">请选择活动期</option>
                            {periods.map((period) => (
                                <option key={period.id} value={period.id}>{period.period_name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="nicknameInput" className="block mb-2 font-bold text-[#6c5ce7] text-base">
                            昵称
                        </label>
                        <input
                            type="text"
                            id="nicknameInput"
                            placeholder="请输入您的昵称"
                            className="w-full p-3 border border-[#ddd] rounded-[10px] text-base bg-white shadow-[0_2px_5px_rgba(0,0,0,0.05)] transition-all duration-300 focus:outline-none focus:border-[#6c5ce7] focus:shadow-[0_0_0_3px_rgba(108,92,231,0.2)]"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                        />
                    </div>

                    {error && (
                        <div className="text-[#ff7675] mt-3 text-center p-4 bg-[#fff8f8] rounded-[10px] border-l-4 border-[#ff7675] text-base mb-4">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            onClick={queryCertificate}
                            disabled={loading}
                            className="flex-1 p-4 bg-[#6c5ce7] text-white border-none rounded-[10px] cursor-pointer transition-all duration-300 text-base font-bold shadow-[0_4px_6px_rgba(108,92,231,0.2)] hover:bg-[#5b4dd1] hover:transform hover:-translate-y-[2px] hover:shadow-[0_6px_10px_rgba(108,92,231,0.3)] active:transform active:translate-y-0"
                        >
                            {loading ? '查询中...' : '查询'}
                        </button>
                        <button
                            onClick={captureScreenshot}
                            className="flex-1 p-4 bg-[#00b894] text-white border-none rounded-[10px] cursor-pointer transition-all duration-300 text-base font-bold shadow-[0_4px_6px_rgba(108,92,231,0.2)] hover:bg-[#00a381] hover:transform hover:-translate-y-[2px] hover:shadow-[0_6px_10px_rgba(108,92,231,0.3)] active:transform active:translate-y-0"
                        >
                            另存图片
                        </button>
                    </div>
                </div>

                {/* 右侧面板 */}
                <div className="w-full lg:w-2/3 p-8 flex justify-center items-center min-h-[600px] bg-white relative overflow-hidden before:content-['hackathonweekly'] before:absolute before:text-[120px] before:font-bold before:opacity-[0.03] before:rotate-[-45deg] before:whitespace-nowrap before:top-1/2 before:left-1/2 before:transform-gpu before:origin-center before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[-45deg] before:text-[#6c5ce7] before:z-0">
                    <iframe
                        ref={certificateFrameRef}
                        src="/certificate"
                        style={{
                            aspectRatio: "1.43/1",
                            width: "100%",
                            maxWidth: "900px",
                            height: "auto",
                            minHeight: "400px",
                            border: "none",
                            borderRadius: "24px",
                            boxShadow: "0 8px 32px rgba(80,60,180,0.10)",
                            background: "transparent",
                            display: "block"
                        }}
                        allowTransparency
                        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                </div>
            </div>
        </div>
    );
} 