import PrismaAdapter from "../config/prisma";
import { Hour, HourUpdate } from "../interfaces";
import { IDayOfWeek } from "../utils/enums";

class HourRepository {
    private prisma = PrismaAdapter.openingHours

    async getAllHour(): Promise<Hour[]> {
        const rows = await this.prisma.findMany({
            select: {
                id: true,
                dayOfWeek: true,
                dayClosed: true,
                openInMinutes: true,
                closeInMinutes: true,
                opeIntervalInMinutes: true,
                closeIntervalInMinutes: true,
            },
        });

        return rows.map((row) => ({
            id: row.id,
            dayOfWeek: row.dayOfWeek as IDayOfWeek,
            dayClosed: row.dayClosed,
            openingInMinutes: row.openInMinutes,
            closeInMinutes: row.closeInMinutes,
            openIntervalInMinutes: row.opeIntervalInMinutes,
            closeIntervalInMinutes: row.closeIntervalInMinutes,
        }));
    }

    async getByIdDay(hourId: string) {
        const row = await PrismaAdapter.openingHours.findUnique({
            where: { id: hourId },
            select: {
                id: true,
                dayOfWeek: true,
                dayClosed: true,
                openInMinutes: true,
                closeInMinutes: true,
                opeIntervalInMinutes: true,
                closeIntervalInMinutes: true,
            },
        });

        return row;
    }

    async updateDay(dayId: string, day: HourUpdate) {
        const row = await this.prisma.update({
            where: { id: dayId },
            data: day,
        });

        return row;
    }
}

export default new HourRepository();