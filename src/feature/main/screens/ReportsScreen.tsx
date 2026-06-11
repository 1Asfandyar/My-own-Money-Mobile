import { useReports } from '@/feature/reports/hooks/useReports';
import ReportsView from '@/feature/reports/views/ReportsView';

const ReportsScreen = () => {
  const vm = useReports();
  return <ReportsView vm={vm} />;
};

export default ReportsScreen;
