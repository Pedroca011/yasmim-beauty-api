import { DayOfWeek } from '@prisma/client';
import PrismaAdapter from '../src/config/prisma';

const prisma = PrismaAdapter;

async function main() {
    const days = Object.values(DayOfWeek);

    const openingHoursData = days.map((day) => {

        let open = 480;
        let close = 1020;
        let startInt = 660;
        let endInt = 720;
        let dayCloesed = false;

        if (day === DayOfWeek.SUNDAY) {
            dayCloesed = true;
        }

        return {
            dayOfWeek: day,
            dayClosed: dayCloesed,
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