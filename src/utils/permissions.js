import { PermissionsBitField } from 'discord.js';

export function checkPermissions(member, permissions = []) {
  if (!permissions.length) return { allowed: true };
  const missing = [];
  for (const perm of permissions) {
    if (!member.permissions.has(PermissionsBitField.Flags[perm])) {
      missing.push(perm);
    }
  }
  return { allowed: missing.length === 0, missing };
}

export function checkBotPermissions(guildMe, permissions = []) {
  if (!permissions.length) return { allowed: true };
  const missing = [];
  for (const perm of permissions) {
    if (!guildMe.permissions.has(PermissionsBitField.Flags[perm])) {
      missing.push(perm);
    }
  }
  return { allowed: missing.length === 0, missing };
}