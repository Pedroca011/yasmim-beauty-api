import PrismaAdapter from "../config/prisma";
import { Hour, HourUpdate } from "../interfaces";
import { DayOfWeek } from "../utils/enums";  // Assumindo enum DayOfWeek

class HourRepository {
  private prisma = PrismaAdapter.openingHours;

  async getAllHour(): Promise<Hour[]> {
    const rows = await this.prisma.findMany({
      select: {
        id: true,
        dayOfWeek: true,
        dayClosed: true,
        openInMinutes: true,
        closeInMinutes: true,
        openIntervalInMinutes: true,
        closeIntervalInMinutes: true,
      },
    });

    return rows.map((row) => ({
      id: row.id,
      dayOfWeek: row.dayOfWeek as DayOfWeek,
      dayClosed: row.dayClosed,
      openInMinutes: row.openInMinutes,
      closeInMinutes: row.closeInMinutes,
      openIntervalInMinutes: row.openIntervalInMinutes,
      closeIntervalInMinutes: row.closeIntervalInMinutes,
    }));
  }

  async getByIdDay(hourId: string): Promise<Hour | null> {
    const row = await this.prisma.findUnique({
      where: { id: hourId },
      select: {
        id: true,
        dayOfWeek: true,
        dayClosed: true,
        openInMinutes: true,
        closeInMinutes: true,
        openIntervalInMinutes: true,
        closeIntervalInMinutes: true,
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      dayOfWeek: row.dayOfWeek as DayOfWeek,
      dayClosed: row.dayClosed,
      openInMinutes: row.openInMinutes,
      closeInMinutes: row.closeInMinutes,
      openIntervalInMinutes: row.openIntervalInMinutes,
      closeIntervalInMinutes: row.closeIntervalInMinutes,
    };
  }

  async updateDay(dayId: string, day: HourUpdate): Promise<Hour> {
    const updated = await this.prisma.update({
      where: { id: dayId },
      data: day,
      select: {
        id: true,
        dayOfWeek: true,
        dayClosed: true,
        openInMinutes: true,
        closeInMinutes: true,
        openIntervalInMinutes: true,
        closeIntervalInMinutes: true,
      },
    });

    return {
      id: updated.id,
      dayOfWeek: updated.dayOfWeek as DayOfWeek,
      dayClosed: updated.dayClosed,
      openInMinutes: updated.openInMinutes,
      closeInMinutes: updated.closeInMinutes,
      openIntervalInMinutes: updated.openIntervalInMinutes,
      closeIntervalInMinutes: updated.closeIntervalInMinutes,
    };
  }

  async getByDayOfWeek(dayOfWeek: DayOfWeek): Promise<Hour | null> {
    const row = await this.prisma.findFirst({
      where: { dayOfWeek },
      select: {
        id: true,
        dayOfWeek: true,
        dayClosed: true,
        openInMinutes: true,
        closeInMinutes: true,
        openIntervalInMinutes: true,
        closeIntervalInMinutes: true,
      },
    });

    if (!row) return null;

    return {
      id: row.id,
      dayOfWeek: row.dayOfWeek as DayOfWeek,
      dayClosed: row.dayClosed,
      openInMinutes: row.openInMinutes,
      closeInMinutes: row.closeInMinutes,
      openIntervalInMinutes: row.openIntervalInMinutes,
      closeIntervalInMinutes: row.closeIntervalInMinutes,
    };
  }
}

export default new HourRepository();