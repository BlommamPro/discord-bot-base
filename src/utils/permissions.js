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

export function checkBotPermissions(guildMe, permissions = [], channel = null) {
  if (!permissions.length) return { allowed: true };
  const missing = [];

  const permissionsToCheck = channel 
    ? channel.permissionsFor(guildMe) 
    : guildMe.permissions;

  for (const perm of permissions) {
    if (!permissionsToCheck.has(PermissionsBitField.Flags[perm])) {
      missing.push(perm);
    }
  }
  
  return { allowed: missing.length === 0, missing };
}