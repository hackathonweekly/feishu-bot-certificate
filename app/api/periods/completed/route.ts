import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// 创建PrismaClient实例
const prisma = new PrismaClient();

export async function GET() {
    try {
        // 查询已结束的活动期，按结束日期降序排序
        const periods = await prisma.period.findMany({
            where: {
                status: '已结束'
            },
            orderBy: {
                end_date: 'desc'
            },
            select: {
                id: true,
                period_name: true
            }
        });

        // 如果没有找到任何期数，返回空数组
        if (!periods || periods.length === 0) {
            return NextResponse.json([]);
        }

        // 返回查询结果
        return NextResponse.json(periods);
    } catch (error) {
        console.error('Error fetching completed periods:', error);
        return NextResponse.json(
            { error: 'Failed to fetch completed periods' },
            { status: 500 }
        );
    }
} 