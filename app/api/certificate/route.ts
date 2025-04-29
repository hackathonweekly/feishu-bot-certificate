import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 创建PrismaClient实例
const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
    // 从URL获取参数
    const searchParams = request.nextUrl.searchParams;
    const period_id = searchParams.get('period_id');
    const nickname = searchParams.get('nickname');

    // 检查必须的参数
    if (!period_id || !nickname) {
        return NextResponse.json(
            { error: 'Missing required parameters: period_id and nickname' },
            { status: 400 }
        );
    }

    try {
        // 查询满足条件的证书
        const result = await prisma.certificate.findUnique({
            where: {
                period_id_nickname: {
                    period_id: parseInt(period_id),
                    nickname: nickname
                }
            },
            select: {
                cer_content: true
            }
        });

        // 检查是否找到证书
        if (!result || !result.cer_content) {
            return NextResponse.json(
                { error: 'Certificate not found' },
                { status: 404 }
            );
        }

        console.log(`SQL 查询结果 cer_content: ${result.cer_content}`);

        // 返回证书内容
        return NextResponse.json({ cer_content: result.cer_content });
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return NextResponse.json(
            { error: 'Failed to fetch certificate' },
            { status: 500 }
        );
    }
} 