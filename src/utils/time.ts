// Transforma um objeto Date em minutos (ex: 14:30 -> 870)
export const dateToMinutes = (date: Date): number => {
    return date.getHours() * 60 + date.getMinutes();
};

// Formata minutos para String HH:mm
export const minutesToHHmm = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

// Checa se o slot pretendido colide com algum agendamento existente
export const hasCollision = (
    slotStart: number,
    slotEnd: number,
    appointments: { start: number; end: number }[]
): boolean => {
    return appointments.some(app => slotStart < app.end && slotEnd > app.start);
};