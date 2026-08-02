import { prisma } from "@/lib/prisma";

export async function getDashboardRawData(month) {
  const now = month ? new Date(`${month}-01`) : new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const maintenance = await prisma.truckExpense.findMany({
    where: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
    include: {
      truck: true,
    },
  });

  return {
    maintenance,
    startOfMonth,
    startOfNextMonth,
  };
}
