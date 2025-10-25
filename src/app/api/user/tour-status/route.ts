import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET - Get user's tour status
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { hasSeenTour: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ hasSeenTour: user.hasSeenTour });
  } catch (error) {
    console.error('Error fetching tour status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST - Update user's tour status
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { hasSeenTour } = body;

    if (typeof hasSeenTour !== 'boolean') {
      return NextResponse.json({ error: 'Invalid hasSeenTour value' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { hasSeenTour },
      select: { hasSeenTour: true },
    });

    return NextResponse.json({ success: true, hasSeenTour: updatedUser.hasSeenTour });
  } catch (error) {
    console.error('Error updating tour status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
