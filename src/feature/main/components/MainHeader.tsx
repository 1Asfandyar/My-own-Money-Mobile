import MainHeaderView from '@/feature/main/components/MainHeaderView';
import { useMainHeader } from '@/feature/main/hooks/useMainHeader';

const MainHeader = () => {
  const header = useMainHeader();

  return <MainHeaderView {...header} />;
};

export default MainHeader;
