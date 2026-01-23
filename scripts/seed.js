import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // 1. Find or create company
    let company = await prisma.company.findFirst({
        where: { name: "Logisco" },
    });

    if (!company) {
        company = await prisma.company.create({
            data: { name: "Logisco" },
        });
    }

    // 2. Find or create truck
    const existingTruck = await prisma.truck.findUnique({
        where: { numberPlate: "TN09AB1234" },
    });

    if (!existingTruck) {
        await prisma.truck.create({
            data: {
                numberPlate: "TN09AB1234",
                companyId: company.id,
            },
        });
    }

    console.log("Seeded company and truck successfully");
}

main()
    .catch(console.error)
