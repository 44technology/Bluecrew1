import { Stack } from 'expo-router';

/**
 * Layout for project segment so that route "project" exists in (tabs).
 * Enables navigation to /project/[id] and /project/[id]/daily-logs etc.
 */
export default function ProjectLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'default',
      }}
    />
  );
}
