'use client';

// 标记此页面为动态渲染，阻止在构建时预渲染
export const dynamic = 'force-dynamic';

import React, { useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

// 创建一个内部组件来使用useSearchParams
function CertificateContent() {
    const searchParams = useSearchParams();
    const period = searchParams.get('period');
    const nickname = searchParams.get('nickname');
    const cerContent = searchParams.get('cerContent');
    const captureAreaRef = useRef<HTMLDivElement>(null);

    // 创建一个标志变量，用于防止重复截图
    const isCapturingRef = useRef(false);

    useEffect(() => {
        // 显示证书内容
        if (period && nickname && cerContent) {
            const subtitleElement = document.getElementById('subtitle');
            const defaultDescElement = document.getElementById('defaultDesc');
            const certBlockElement = document.getElementById('certBlock');
            const nicknameElement = document.getElementById('nickname');
            const periodElement = document.getElementById('period');
            const cerContentElement = document.getElementById('cerContent');

            if (subtitleElement) subtitleElement.textContent = '';
            if (defaultDescElement) defaultDescElement.style.display = 'none';
            if (certBlockElement) certBlockElement.style.display = '';
            if (nicknameElement) nicknameElement.textContent = nickname;
            if (periodElement) periodElement.textContent = period;
            if (cerContentElement) cerContentElement.textContent = cerContent;
        }

        // 日期自动填充
        const dateElement = document.getElementById('date');
        if (dateElement) {
            const now = new Date();
            dateElement.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
        }

        // 重置截图标志
        isCapturingRef.current = false;

        // 检查 autoSave 参数
        if (searchParams.get('autoSave') === '1') {
            // 使用较长的延迟确保内容已完全加载
            setTimeout(() => {
                if (!isCapturingRef.current) {
                    captureScreenshot();
                }
            }, 800);
        }

        // 监听来自父窗口的消息
        const handleMessage = (event: MessageEvent) => {
            console.log('certificate.html 收到消息:', event.data);
            if (event.data === 'captureImage' && !isCapturingRef.current) {
                console.log('接收到截图请求');
                captureScreenshot();
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [period, nickname, cerContent, searchParams]);

    const captureScreenshot = async () => {
        try {
            // 设置截图标志为true，防止重复截图
            isCapturingRef.current = true;
            console.log('开始截图过程，设置标志为true');

            // 截图前将标题样式改为纯色
            const title = document.querySelector('h1');
            const oldClass = title?.className || '';
            if (title) {
                title.className = 'text-5xl font-extrabold text-purple-600 tracking-wide mb-2 select-none';
            }

            // 检查目标元素
            const award = document.getElementById('capture-area');
            if (!award) {
                console.error('截图元素不存在');
                isCapturingRef.current = false; // 重置标志
                return;
            }

            console.log('award:', award, award.offsetWidth, award.offsetHeight, window.getComputedStyle(award).display);

            // 检查图片加载
            const images = document.querySelectorAll('img');
            for (const img of Array.from(images)) {
                if (!(img as HTMLImageElement).complete || (img as HTMLImageElement).naturalWidth === 0) {
                    console.warn('图片未加载完成:', img.src);
                }
            }

            // 等待更久
            await new Promise(resolve => setTimeout(resolve, 1200));

            // 截图
            const canvas = await window.html2canvas(award, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#fff',
                logging: true
            });

            console.log('转换为图片数据');
            // 转换为图片数据
            const imageData = canvas.toDataURL('image/png');

            // 截图后恢复标题样式
            if (title) {
                title.className = oldClass;
            }

            // 判断是否在 iframe 里
            if (window.self === window.top) {
                // 顶层页面，直接下载
                const a = document.createElement('a');
                a.href = imageData;
                a.download = `certificate_${nickname || ''}_${Date.now()}.png`;
                a.click();
            } else {
                // 在 iframe 里，发消息给父窗口
                window.parent.postMessage({
                    type: 'certificateImage',
                    imageData: imageData
                }, '*');
            }

            console.log('截图过程完成');
        } catch (error) {
            console.error('截图失败:', error);
            alert('截图失败: ' + (error instanceof Error ? error.message : String(error)));
        } finally {
            // 无论成功还是失败，最后都要重置截图标志
            isCapturingRef.current = false;
            console.log('截图过程结束，重置标志为false');
        }
    };

    return (
        <>
            <Script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js" />

            <style jsx global>{`
                html, body {
                    height: 100%;
                    margin: 0;
                    padding: 0;
                }
                body {
                    min-height: 100vh;
                    min-width: 100vw;
                    background: linear-gradient(180deg, #dbeafe 0%, #f3e8ff 100%);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .award-bg {
                    position: absolute;
                    z-index: 0;
                    filter: blur(32px) saturate(1.2);
                    opacity: 0.5;
                    pointer-events: none;
                }
                .blob1 {
                    left: 5vw; 
                    top: 10vh; 
                    width: 320px; 
                    height: 180px;
                    background: radial-gradient(circle at 60% 40%, #a78bfa 0%, #dbeafe 80%, transparent 100%);
                }
                .blob2 {
                    right: 0; 
                    bottom: 0; 
                    width: 340px; 
                    height: 180px;
                    background: radial-gradient(circle at 60% 40%, #7c3aed 0%, #f3e8ff 80%, transparent 100%);
                }
                .fade-in {
                    animation: fadeIn 1.2s cubic-bezier(.4,0,.2,1);
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .award-content {
                    position: relative;
                    width: 100vw;
                    height: 100vh;
                    min-height: 100vh;
                    min-width: 100vw;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .award-inner {
                    width: 1000px;
                    height: 700px;
                    position: relative;
                    max-width: 1000px;
                    aspect-ratio: 1.43/1;
                    min-width: 320px;
                    min-height: 224px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: space-between;
                    margin: auto;
                    background: linear-gradient(180deg, #dbeafe 0%, #f3e8ff 100%);
                    box-shadow: 0 8px 32px rgba(80,60,180,0.10);
                    border-radius: 24px;
                    padding: 0;
                }
                @media (max-width: 1100px) {
                    .award-inner { 
                        width: 98vw; 
                        height: auto; 
                    }
                }
                @media (max-width: 600px) {
                    .award-inner {
                        max-width: 100vw;
                        min-width: unset;
                        padding: 0 2vw;
                    }
                }
            `}</style>

            <div className="award-content">
                {/* 渐变色块装饰 */}
                <div className="award-bg blob1"></div>
                <div className="award-bg blob2"></div>
                <div className="award-inner" id="capture-area" ref={captureAreaRef}>
                    {/* 标题 */}
                    <div className="w-full text-center mt-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-purple-300 bg-clip-text text-transparent tracking-wide mb-2 select-none">Build In Public 电子奖状</h1>
                        <p id="subtitle" className="text-lg md:text-xl text-gray-700 font-semibold mt-2">奖状说明</p>
                    </div>

                    {/* 关键信息/正文内容 */}
                    <div className="flex-1 flex flex-col justify-center items-center w-full">
                        <div className="w-full max-w-xl mx-auto text-center">
                            <div id="infoBlock">
                                <div className="text-base md:text-sm text-gray-800 leading-relaxed mb-8" id="defaultDesc">
                                    <p>通过公开展示自己的工作进度，获取反馈，提升自我，并与社区成员互相学习。</p>
                                    <p>完成活动的参与者将获得定制的电子证书，以表彰他们的努力和贡献。</p>
                                    <p>请在左侧选择您参与的活动期数和您的昵称，点击"查询"按钮查看您的证书。</p>
                                </div>
                                <div id="certBlock" style={{ display: 'none' }}>
                                    <div className="mb-6">
                                        <span className="text-xl md:text-2xl font-bold text-gray-900">获奖者：</span>
                                        <span id="nickname" className="text-xl md:text-2xl font-extrabold text-purple-700"></span>
                                    </div>
                                    <div className="text-base md:text-lg text-gray-800 leading-relaxed mb-8">
                                        <p>参与期数：<span id="period" className="font-bold text-purple-700"></span></p>
                                        <p id="cerContent"></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LOGO区和日期 */}
                    <div className="w-full flex items-end justify-between px-8 pb-8 mt-4">
                        <div className="flex items-center gap-6">
                            <img src="/img/logo.png" alt="hackathonweekly" className="w-1/3 h-auto" crossOrigin="anonymous" />
                        </div>
                        <div className="text-sm text-gray-500 text-right w-1/2">
                            <div>hackathonweekly 社区</div>
                            <div id="date"></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

// 使用Suspense包装需要useSearchParams的组件
export default function CertificatePage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-screen w-screen bg-gradient-to-b from-[#dbeafe] to-[#f3e8ff]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-purple-600 mb-4">加载中...</h2>
                    <p className="text-gray-600">证书内容正在准备中，请稍候...</p>
                </div>
            </div>
        }>
            <CertificateContent />
        </Suspense>
    );
}

// 扩展window对象，以支持html2canvas
declare global {
    interface Window {
        html2canvas: any;
    }
} 