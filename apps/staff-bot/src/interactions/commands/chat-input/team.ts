import {
  bold,
  MessageFlags,
  PermissionsBitField,
  quote,
  SlashCommandBuilder,
  userMention,
} from "discord.js";

import { ChatInputCommandHandler } from "@extasy/core";

import {
  BRANCH_TITLE,
  ROLE_TITLE,
  type StaffBranchCode,
  type StaffRole,
} from "@constants/team";
import { TeamService, TeamServiceError } from "@services/team.service";

const branchChoices: Array<{ name: string; value: StaffBranchCode }> = [
  { name: "Close", value: "close" },
  { name: "Eventer", value: "eventer" },
  { name: "Moderation", value: "moderation" },
  { name: "Support", value: "support" },
];

const branchRoleChoices: Array<{ name: string; value: StaffRole }> = [
  { name: "Admin", value: "admin" },
  { name: "Magister", value: "magister" },
  { name: "Curator", value: "curator" },
  { name: "Staff Member", value: "staff_member" },
];

const data = new SlashCommandBuilder()
  .setName("team")
  .setDescription("Менеджмент персонала")
  .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("profile")
      .setDescription("Показать активный профиль сотрудника")
      .addUserOption((option) =>
        option.setName("user").setDescription("Пользователь").setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("assign")
      .setDescription("Назначить роль на ветку")
      .addUserOption((option) =>
        option.setName("user").setDescription("Пользователь").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("branch")
          .setDescription("Ветка")
          .setRequired(true)
          .addChoices(...branchChoices),
      )
      .addStringOption((option) =>
        option
          .setName("role")
          .setDescription("Роль на ветке")
          .setRequired(true)
          .addChoices(...branchRoleChoices),
      )
      .addStringOption((option) =>
        option.setName("reason").setDescription("Причина").setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("remove")
      .setDescription("Снять роль с ветки")
      .addUserOption((option) =>
        option.setName("user").setDescription("Пользователь").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("branch")
          .setDescription("Ветка")
          .setRequired(true)
          .addChoices(...branchChoices),
      )
      .addStringOption((option) =>
        option.setName("reason").setDescription("Причина").setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("blacklist-global-add")
      .setDescription("Выдать глобальный ЧС стаффа")
      .addUserOption((option) =>
        option.setName("user").setDescription("Пользователь").setRequired(true),
      )
      .addStringOption((option) =>
        option.setName("reason").setDescription("Причина").setRequired(true),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("blacklist-global-remove")
      .setDescription("Снять глобальный ЧС стаффа")
      .addUserOption((option) =>
        option.setName("user").setDescription("Пользователь").setRequired(true),
      )
      .addStringOption((option) =>
        option
          .setName("reason")
          .setDescription("Причина снятия")
          .setRequired(false),
      ),
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("branch-list")
      .setDescription("Список активных сотрудников ветки")
      .addStringOption((option) =>
        option
          .setName("branch")
          .setDescription("Ветка")
          .setRequired(true)
          .addChoices(...branchChoices),
      ),
  );

export default new ChatInputCommandHandler(data, async (interaction) => {
  if (!interaction.inCachedGuild()) return;

  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case "profile": {
        const user = interaction.options.getUser("user", true);
        const profile = await TeamService.getProfile(user.id);

        const assignmentLines = profile.assignments.length
          ? profile.assignments.map((row) => {
              const branch = row.branchId ? ` | branchId: ${row.branchId}` : "";
              return `- ${ROLE_TITLE[row.role]}${branch}`;
            })
          : ["- Нет активных назначений"];

        const blacklistLine = profile.globalBlacklist
          ? `Глобальный ЧС: ${bold("активен")}, причина: ${profile.globalBlacklist.reason}`
          : `Глобальный ЧС: ${bold("нет")}`;

        await interaction.reply({
          content: [
            `${bold("Профиль")}: ${userMention(user.id)}`,
            blacklistLine,
            `${bold("Активные назначения")}:`,
            ...assignmentLines,
          ].join("\n"),
          flags: [MessageFlags.Ephemeral],
        });
        break;
      }

      case "assign": {
        const user = interaction.options.getUser("user", true);
        const branchCode = interaction.options.getString(
          "branch",
          true,
        ) as StaffBranchCode;
        const role = interaction.options.getString("role", true) as StaffRole;
        const reason = interaction.options.getString("reason") ?? undefined;

        const result = await TeamService.assignBranchRole({
          actorUserId: interaction.user.id,
          targetUserId: user.id,
          role,
          branchCode,
          reason,
          targetDisplayName: user.username,
        });

        await interaction.reply({
          content: quote(
            `${userMention(user.id)} назначен на ${bold(ROLE_TITLE[role])} в ветку ${bold(BRANCH_TITLE[branchCode])}.`,
          ),
          flags: [MessageFlags.Ephemeral],
        });

        await interaction.followUp({
          content: `assignmentId: ${result.assignment.id}`,
          flags: [MessageFlags.Ephemeral],
        });
        break;
      }

      case "remove": {
        const user = interaction.options.getUser("user", true);
        const branchCode = interaction.options.getString(
          "branch",
          true,
        ) as StaffBranchCode;
        const reason = interaction.options.getString("reason") ?? undefined;

        await TeamService.removeBranchRole({
          actorUserId: interaction.user.id,
          targetUserId: user.id,
          branchCode,
          reason,
        });

        await interaction.reply({
          content: quote(
            `${userMention(user.id)} снят с ветки ${bold(BRANCH_TITLE[branchCode])}.`,
          ),
          flags: [MessageFlags.Ephemeral],
        });
        break;
      }

      case "blacklist-global-add": {
        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason", true);

        await TeamService.addGlobalBlacklist({
          actorUserId: interaction.user.id,
          targetUserId: user.id,
          reason,
          targetDisplayName: user.username,
        });

        await interaction.reply({
          content: quote(
            `${userMention(user.id)} выдан глобальный ${bold("ЧС стаффа")}.`,
          ),
          flags: [MessageFlags.Ephemeral],
        });
        break;
      }

      case "blacklist-global-remove": {
        const user = interaction.options.getUser("user", true);
        const reason = interaction.options.getString("reason") ?? undefined;

        await TeamService.removeGlobalBlacklist({
          actorUserId: interaction.user.id,
          targetUserId: user.id,
          reason,
        });

        await interaction.reply({
          content: quote(
            `С ${userMention(user.id)} снят глобальный ${bold("ЧС стаффа")}.`,
          ),
          flags: [MessageFlags.Ephemeral],
        });
        break;
      }

      case "branch-list": {
        const branchCode = interaction.options.getString(
          "branch",
          true,
        ) as StaffBranchCode;
        const { rows } = await TeamService.getActiveBranchMembers(branchCode);

        const lines = rows.length
          ? rows.map(
              (row) => `- ${userMention(row.userId)}: ${ROLE_TITLE[row.role]}`,
            )
          : ["- Ветка пустая"];

        await interaction.reply({
          content: [
            `${bold("Ветка")}: ${BRANCH_TITLE[branchCode]}`,
            ...lines,
          ].join("\n"),
          flags: [MessageFlags.Ephemeral],
        });

        break;
      }

      default:
        await interaction.reply({
          content: quote("Неизвестная команда."),
          flags: [MessageFlags.Ephemeral],
        });
        break;
    }
  } catch (error) {
    const message =
      error instanceof TeamServiceError
        ? error.message
        : "Не удалось выполнить действие. Проверь данные и права.";

    await interaction.reply({
      content: quote(message),
      flags: [MessageFlags.Ephemeral],
    });
  }
});
