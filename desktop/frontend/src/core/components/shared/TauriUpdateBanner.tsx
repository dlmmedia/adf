import { Group, Text, Button, Loader, Paper } from '@mantine/core';
import { useTauriUpdater } from '@app/hooks/useTauriUpdater';

export default function TauriUpdateBanner() {
  const { isTauri, updateInfo, installing, installUpdate, dismissUpdate } = useTauriUpdater();

  if (!isTauri || !updateInfo.available) return null;

  return (
    <Paper
      p="xs"
      radius={0}
      style={{
        background: 'var(--mantine-color-blue-light)',
        borderBottom: '1px solid var(--mantine-color-blue-outline)',
        position: 'relative',
        zIndex: 100,
      }}
    >
      <Group justify="center" gap="md">
        <Text size="sm" fw={500}>
          DLM ADF v{updateInfo.version} is available
        </Text>
        <Button
          size="xs"
          variant="filled"
          color="blue"
          onClick={installUpdate}
          disabled={installing}
          leftSection={installing ? <Loader size={12} color="white" /> : null}
        >
          {installing ? 'Installing...' : 'Update Now'}
        </Button>
        <Button size="xs" variant="subtle" color="gray" onClick={dismissUpdate}>
          Later
        </Button>
      </Group>
    </Paper>
  );
}
