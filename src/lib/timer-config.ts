import { prisma } from '@/lib/db';

/**
 * Gets or creates the site settings
 */
async function getOrCreateSettings() {
  let settings = await prisma.siteSettings.findFirst();

  if (!settings) {
    // Create default settings
    settings = await prisma.siteSettings.create({
      data: {
        timerEnabled: true,
        timerDurationDays: 7,
        lastResetAt: new Date(),
      },
    });
  }

  return settings;
}

/**
 * Calculates the timer end date with auto-loop functionality
 * If the timer has expired, it automatically resets and returns the new end date
 */
export async function getTimerEndDate(): Promise<{
  endDate: Date;
  enabled: boolean;
  durationDays: number;
  wasReset: boolean;
}> {
  const settings = await getOrCreateSettings();

  if (!settings.timerEnabled) {
    // Return a future date even when disabled, for UI purposes
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + settings.timerDurationDays);
    return {
      endDate: futureDate,
      enabled: false,
      durationDays: settings.timerDurationDays,
      wasReset: false,
    };
  }

  // Calculate the end date based on last reset + duration
  const endDate = new Date(settings.lastResetAt);
  endDate.setDate(endDate.getDate() + settings.timerDurationDays);

  const now = new Date();
  let wasReset = false;

  // Auto-loop: If the timer has expired, reset it
  if (now >= endDate) {
    // Update the last reset time to now
    await prisma.siteSettings.update({
      where: { id: settings.id },
      data: { lastResetAt: now },
    });

    // Calculate new end date
    const newEndDate = new Date(now);
    newEndDate.setDate(newEndDate.getDate() + settings.timerDurationDays);

    return {
      endDate: newEndDate,
      enabled: true,
      durationDays: settings.timerDurationDays,
      wasReset: true,
    };
  }

  return {
    endDate,
    enabled: true,
    durationDays: settings.timerDurationDays,
    wasReset: false,
  };
}

/**
 * Gets the current timer settings without auto-reset logic
 * Useful for admin panel display
 */
export async function getTimerSettings() {
  const settings = await getOrCreateSettings();

  const endDate = new Date(settings.lastResetAt);
  endDate.setDate(endDate.getDate() + settings.timerDurationDays);

  return {
    id: settings.id,
    enabled: settings.timerEnabled,
    durationDays: settings.timerDurationDays,
    lastResetAt: settings.lastResetAt,
    endDate,
    isExpired: new Date() >= endDate,
  };
}

/**
 * Updates the timer settings
 */
export async function updateTimerSettings(data: {
  enabled?: boolean;
  durationDays?: number;
  resetNow?: boolean;
}) {
  const settings = await getOrCreateSettings();

  const updateData: any = {};

  if (typeof data.enabled === 'boolean') {
    updateData.timerEnabled = data.enabled;
  }

  if (data.durationDays !== undefined) {
    updateData.timerDurationDays = data.durationDays;
  }

  if (data.resetNow) {
    updateData.lastResetAt = new Date();
  }

  const updatedSettings = await prisma.siteSettings.update({
    where: { id: settings.id },
    data: updateData,
  });

  return updatedSettings;
}
