import useManageAccounts from '@/feature/accounts/hooks/useManageAccounts';
import ManageAccountsView from '@/feature/accounts/views/ManageAccountsView';

const ManageAccountsScreen = () => {
  const manager = useManageAccounts();

  return <ManageAccountsView manager={manager} />;
};

export default ManageAccountsScreen;
