import { DayOfWeek } from '@prisma/client';
import PrismaAdapter from '../src/config/prisma';

const prisma = PrismaAdapter;

async function main() {
    const days = Object.values(DayOfWeek);

    const openingHoursData = days.map((day) => {

        let open = 540;
        let close = 1080;
        let startInt = 720;
        let endInt = 780;

        if (day === DayOfWeek.SUNDAY) {
            close = 900;
        }

        return {
            dayOfWeek: day,
            dayClosed: false,
            openInMinutes: open,
            openIntervalInMinutes: startInt,
            closeIntervalInMinutes: endInt,
            closeInMinutes: close,
        };
    });

    console.log('Limpando horários antigos...');
    await prisma.openingHours.deleteMany();

    console.log('Populando horários de abertura...');
    for (const data of openingHoursData) {
        await prisma.openingHours.create({ data });
    }

    console.log('Seed finalizado com sucesso!');
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })