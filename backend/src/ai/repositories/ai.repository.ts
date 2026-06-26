import prisma from '../../config/prisma';

export const getUserSecurityContext = async (ownerId: string) => {
  return await prisma.asset.findMany({
    where: { ownerId },
    include: {
      hosts: {
        include: {
          services: {
            include: {
              vulnerabilities: true,
            },
          },
        },
      },
      scanHosts: {
        include: {
          ports: true,
        },
      },
    },
  });
};
