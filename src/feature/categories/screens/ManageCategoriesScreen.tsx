import useManageCategories from '@/feature/categories/hooks/useManageCategories';
import ManageCategoriesView from '@/feature/categories/views/ManageCategoriesView';

const ManageCategoriesScreen = () => {
  const manager = useManageCategories();

  return <ManageCategoriesView manager={manager} />;
};

export default ManageCategoriesScreen;
