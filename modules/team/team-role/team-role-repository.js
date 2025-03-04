import prisma from "../../../config/prisma.js";

class TeamRoleRepository {
  // Fetch all stored team roles
  static async getAllTeamRoles() {
    return await prisma.teamRole.findMany({
      select: {
        id: true,
        uuid: true,
        identifier: true,
        display: true,
        name: true,
        members: true,
        creator: true,
        createdAt: true,
      },
    });
  }

  // Fetch team role by UUID
  static async getTeamRoleByUUID(uuid) {
    return await prisma.teamRole.findUnique({
      where: { uuid },
      select: {
        id: true,
        uuid: true,
        identifier: true,
        display: true,
        name: true,
        members: true,
        creator: true,
        createdAt: true,
      },
    });
  }

  // Store team roles fetched from OpenMRS
  static async upsertTeamRoles(teamRoles) {
    return await Promise.all(
      teamRoles.map(async (role) => {
        return prisma.teamRole.upsert({
          where: { uuid: role.uuid },
          update: {
            identifier: role.identifier,
            display: role.display,
            name: role.name,
            members: role.members,
            creator: role.creator,
          },
          create: {
            uuid: role.uuid,
            identifier: role.identifier,
            display: role.display,
            name: role.name,
            members: role.members,
            creator: role.creator,
          },
        });
      })
    );
  }
}

export default TeamRoleRepository;
