import prisma from "./prisma.js";

const PREFIXES = {
  INCIDENT: "INC",
  PROBLEM: "PRB",
  CHANGE: "CHG",
  REQUEST: "RITM",
};

export async function generateTicketNumber(type) {
  const prefix = PREFIXES[type];

  const counter = await prisma.counter.upsert({
    where: { prefix },
    update: { value: { increment: 1 } },
    create: { prefix, value: 1001 },
  });

  const paddedNumber = String(counter.value).padStart(7, "0");
  return `${prefix}${paddedNumber}`;
}