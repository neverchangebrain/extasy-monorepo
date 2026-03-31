import { staffBranchCode, staffRole } from "@extasy/db";

export type StaffRole = (typeof staffRole.enumValues)[number];
export type StaffBranchCode = (typeof staffBranchCode.enumValues)[number];

export const GLOBAL_ROLES: StaffRole[] = ["owner", "dev", "staff_admin"];
export const BRANCH_ROLES: StaffRole[] = [
  "admin",
  "magister",
  "curator",
  "staff_member",
];
export const MANAGEMENT_ROLES: StaffRole[] = ["admin", "magister", "curator"];

export const ROLE_WEIGHT: Record<StaffRole, number> = {
  owner: 100,
  dev: 90,
  staff_admin: 80,
  admin: 50,
  magister: 40,
  curator: 30,
  staff_member: 10,
};

export const ROLE_TITLE: Record<StaffRole, string> = {
  owner: "Owner",
  dev: "Dev",
  staff_admin: "Staff Admin",
  admin: "Admin",
  magister: "Magister",
  curator: "Curator",
  staff_member: "Staff Member",
};

export const BRANCH_TITLE: Record<StaffBranchCode, string> = {
  close: "Close",
  eventer: "Eventer",
  moderation: "Moderation",
  support: "Support",
};
