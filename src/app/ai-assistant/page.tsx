import AppShell from '@/components/layout/AppShell';
import PageHeader from '@/components/layout/PageHeader';
import ChatInterface from '@/components/assistant/ChatInterface';
export default function AssistantPage() {
  return <AppShell><PageHeader title="AI Assistant" subtitle="General guidance to help you find suitable care." /><ChatInterface /></AppShell>;
}
